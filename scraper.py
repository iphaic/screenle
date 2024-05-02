import pandas as pd
import requests
from bs4 import BeautifulSoup
import numpy as np

# Initialize the base URL
base_url = 'https://www.imdb.com/list/ls098063263/'
page_number = 1

# Create empty lists to store the data
movie_name = []
year = []
genre = []
rating = []
duration = []
certificates = []
worldwide_lt_gross = []
metascore = []
directors = []
logline = []

while len(movie_name) < 999:
    # Construct the URL with the correct page number
    if page_number == 1:
        url = base_url
    else:
        url = f'{base_url}?page={page_number}'
        
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')

    # Extract data and append to the lists
    movie_data = soup.findAll('div', attrs= {'class': 'lister-item mode-detail'})
    for store in movie_data:
        name = store.h3.a.text
        movie_name.append(name)
        
        release_year = store.h3.find('span', class_ ='lister-item-year text-muted unbold').text.strip('()I ')
        year.append(release_year)
        
        runtime = store.p.find('span', class_ = 'runtime').text.replace(' min', '')
        duration.append(runtime)
        
        genre_type = store.p.find('span', class_ = 'genre').text.strip()
        genre.append(genre_type)
        
        rate = store.find('div', class_='ipl-rating-star').text.strip()
        rating.append(rate)
        
        meta = store.find('span', class_='metascore').text.strip() if store.find('span', class_='metascore') else 'No Score Posted'
        metascore.append(meta)
        
        certificate = store.find('span', class_='certificate').text if store.find('span', class_='certificate') else 'Not Rated'
        certificates.append(certificate)
        
        director_tag = None
        for p_tag in store.find_all('p', class_='text-muted text-small'):
            if 'Director:' in p_tag.get_text():
                director_tag = p_tag
                break
        director_name = director_tag.find('a').text if director_tag and director_tag.find('a') else 'Multiple Directors'
        directors.append(director_name)
        
        lifetime_gross = store.find('div', class_='list-description').text.replace('Worldwide Lifetime Gross: ', '') if store.find('div', class_='list-description') else '******'
        worldwide_lt_gross.append(lifetime_gross)
        
        summary = store.find('p', class_ = '').text.strip()
        logline.append(summary)
        
    # Progress output
    print(f'Collected {len(movie_name)} out of 1000 entries')
    
    # Check for the 'Next' button to proceed to the next page, or break the loop if no more pages
    next_button = soup.find('a', class_='flat-button lister-page-next next-page')
    if next_button:
        page_number += 1
    else:
        break

# Create a DataFrame with the collected data
movie_DF = pd.DataFrame({
    'Movie Title': movie_name, 
    'Year of Release': year,
    'Genre': genre,
    'Movie Rating': rating,
    'Duration': duration,
    'Certificate': certificates,
    'Worldwide LT Gross': worldwide_lt_gross,
    'Metascore': metascore,
    'Director': directors,
    'Logline': logline
})

# Export to CSV
movie_DF.to_csv('imdb_top_films.csv', index=False)

print("Data collection complete. CSV file has been created.")