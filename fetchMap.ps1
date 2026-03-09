New-Item -Path "public\topojson" -ItemType Directory -Force
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/thailand/thailand-provinces.json" -OutFile "public\topojson\thailand-provinces.topojson"
