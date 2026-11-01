import asyncio
import aiohttp
from utils.db import table_is_populated
from database import engine, SessionLocal
from app.models import Kanji
from typing import List

async def get_kanji_data_by_grade(grade:int) -> List[str]:

    if grade not in range(1,6):
        return []
 
    url = "https://kanjialive-api.p.rapidapi.com/api/public/search/advanced/"

    querystring = {"grade": str(grade)}

    headers = {
        "x-rapidapi-key": "77e20574cemsha4e151f542aad6cp10fb6ejsn136b73c9ccc6",
        "x-rapidapi-host": "kanjialive-api.p.rapidapi.com",
        "Content-Type": "application/json"
    }


    async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=False)) as session:
        async with session.get(url=url, headers=headers, params=querystring) as response:

            kanji_response = await response.json()

            grade_list = [kanji["kanji"]["character"] for kanji in kanji_response]
    
            results = await asyncio.gather(*[get_single_kanji_data(session, kanji) for kanji in grade_list])
    

    
    return results
            




async def get_single_kanji_data(session, kanji:str) -> dict:


    url = f"https://kanjialive-api.p.rapidapi.com/api/public/kanji/{kanji}"

    headers = {
        "x-rapidapi-key": "77e20574cemsha4e151f542aad6cp10fb6ejsn136b73c9ccc6",
        "x-rapidapi-host": "kanjialive-api.p.rapidapi.com",
        "Content-Type": "application/json"
    }

    async with session.get(url, headers=headers) as response:
        return await response.json()
    


async def seed_kanji_table(grade_number: int):


    async with SessionLocal() as session:

        table_populated = await table_is_populated(table="kanji", session=session)

        if table_populated:
            
            print("Table is already populated")
            return 

        kanji_grade_list = await get_kanji_data_by_grade(grade_number)


        for kanji in kanji_grade_list:
            new_kanji = Kanji(
                character = kanji["ka_utf"],
                meaning = kanji["meaning"],
                onyomi = kanji["onyomi"] if kanji["onyomi"] != "n/a" else None,
                kunyomi = kanji["kunyomi"] if kanji["kunyomi"] != "n/a" else None,
                radical = kanji["rad_utf"],
                jlpt_level = grade_number
            )
            session.add(new_kanji)

        await session.commit()



if __name__ == "__main__":
    asyncio.run(seed_kanji_table(1)) # for MVP, grade 1 is fine but for production would need 1-5 immediately