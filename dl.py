import urllib.request
import os

try:
    os.makedirs('public/topojson', exist_ok=True)
    url = 'https://raw.githubusercontent.com/deldersveld/topojson/master/countries/thailand/thailand-provinces.json'
    urllib.request.urlretrieve(url, 'public/topojson/thailand-provinces.topojson')
    with open('dl_status.txt', 'w') as f:
        f.write('Success')
except Exception as e:
    with open('dl_status.txt', 'w') as f:
        f.write(str(e))
