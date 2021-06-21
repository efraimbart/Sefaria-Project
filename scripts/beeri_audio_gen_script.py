import django
django.setup()

import csv
import json
import collections

from sefaria.model import *
from sefaria.system import exceptions
from sefaria.system.database import db

def generate_timestamps_from_array(media_array, source, source_he, media_type, license, source_site, description, description_he ):
    for media_uri in media_array:
        data = {
            'media_url': media_uri,
            'source': source,
            'source_he': source_he,
            'media_type': media_type,
            'license': license,
            'source_site': source_site,
            'description': description,
            'description_he': description_he
        }

        refs = []

        for row in media_array[media_uri]:
            refs.append({
                "sefaria_ref": row[0],
                "start_time": row[2],
                "end_time": row[3],
            })

        data["ref"] = refs

        # print(data)

        db.media.save(data)
        db.media.ensure_index("ref.sefaria_ref")

def load_csv_and_split_by_section(filename, base_uri):
    with open(filename, newline='') as csvfile:
        csv_reader = csv.reader(csvfile, delimiter=',')

        files = collections.defaultdict(list)

        previous_section_num = 0
        for row in csv_reader:
            media_url = f'{base_uri}{Ref(row[0]).sections[0]:03}.mp3'
            files[media_url].append(row)

        return(files)



media = load_csv_and_split_by_section('scripts/torah_audio/beeri_leviticus.csv', 'https://storage.googleapis.com/sefaria-audio/beeri/03Tc_Vayiqra-_')

generate_timestamps_from_array(
    media_array = media,
    source = 'Rabbi Dan Be\'eri',
    source_he = 'הרב דן בארי',
    media_type = 'Torah Reading',
    license = 'CC-BY-SA',
    source_site = 'https://archive.org/details/Tanakh_Cantillation_Beeri_03Leviticus',
    description = '',
    description_he = ''
)


media = load_csv_and_split_by_section('scripts/torah_audio/beeri_deuteronomy.csv', 'https://storage.googleapis.com/sefaria-audio/beeri/05Tc_devarim-_')

generate_timestamps_from_array(
    media_array = media,
    source = 'Rabbi Dan Be\'eri',
    source_he = 'הרב דן בארי',
    media_type = 'Torah Reading',
    license = 'CC-BY-SA',
    source_site = 'https://archive.org/details/Tanakh_Cantillation_Beeri_05Deuteronomy',
    description = '',
    description_he = ''
)


media = load_csv_and_split_by_section('scripts/torah_audio/beeri_exodus.csv', 'https://storage.googleapis.com/sefaria-audio/beeri/02Tc_shemot--_')

generate_timestamps_from_array(
    media_array = media,
    source = 'Rabbi Dan Be\'eri',
    source_he = 'הרב דן בארי',
    media_type = 'Torah Reading',
    license = 'CC-BY-SA',
    source_site = 'https://archive.org/details/Tanakh_Cantillation_Beeri_02Exodus',
    description = '',
    description_he = ''
)


media = load_csv_and_split_by_section('scripts/torah_audio/beeri_genesis.csv', 'https://storage.googleapis.com/sefaria-audio/beeri/01Tc_bereshit_')

generate_timestamps_from_array(
    media_array = media,
    source = 'Rabbi Dan Be\'eri',
    source_he = 'הרב דן בארי',
    media_type = 'Torah Reading',
    license = 'CC-BY-SA',
    source_site = 'https://archive.org/details/Tanakh_Cantillation_Beeri_01Genesis',
    description = '',
    description_he = ''
)



media = load_csv_and_split_by_section('scripts/torah_audio/beeri_numbers.csv', 'https://storage.googleapis.com/sefaria-audio/beeri/04Tc_bemidbar_')

generate_timestamps_from_array(
    media_array = media,
    source = 'Rabbi Dan Be\'eri',
    source_he = 'הרב דן בארי',
    media_type = 'Torah Reading',
    license = 'CC-BY-SA',
    source_site = 'https://archive.org/details/Tanakh_Cantillation_Beeri_04Numbers',
    description = '',
    description_he = ''
)
