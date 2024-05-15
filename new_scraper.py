from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time
import csv

def fetch_movie_data(url, max_movies):
    start_time = time.time()
    service = Service()
    driver = webdriver.Chrome(service=service)

    driver.get(url)
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, "div.sc-74bf520e-3.klvfeN.dli-parent")))
    
    movies = []
    title_count = {}

    while len(movies) < max_movies:
        max_scroll_height = driver.execute_script("return document.body.scrollHeight")
        current_scroll_height = driver.execute_script("return window.scrollY + window.innerHeight")

        # Compare current scroll height to max_scroll_height
        while current_scroll_height != max_scroll_height or current_scroll_height < 250000:
            # Scroll more if they are not equal
            driver.execute_script(f"window.scrollTo(0, {max_scroll_height});")
            time.sleep(0.5)
            max_scroll_height = driver.execute_script("return document.body.scrollHeight")
            current_scroll_height = driver.execute_script("return window.scrollY + window.innerHeight")
            print(current_scroll_height)

        # Get all the 'more info' buttons visible on the page
        buttons = driver.find_elements(By.CSS_SELECTOR, "button.ipc-icon-button.dli-info-icon")

        for button in buttons:
            # Check if we've collected enough movies
            if len(movies) >= max_movies:
                break

            # Click the 'more info' button to reveal hidden content
            driver.execute_script("arguments[0].click();", button)
            WebDriverWait(driver, 2).until(EC.visibility_of_element_located((By.CSS_SELECTOR, "div.ipc-promptable-base__panel")))
            
            # Allow time for the content to load dynamically
            time.sleep(0.001)  # Adjust timing as necessary
            
            # Get the updated HTML source and parse with BeautifulSoup
            html_source = driver.page_source
            soup = BeautifulSoup(html_source, 'html.parser')
            
            # Find the parent container for the clicked movie
            movie_container = button.find_element(By.XPATH, "./ancestor::div[contains(@class, 'dli-parent')]")
            soup_movie = BeautifulSoup(movie_container.get_attribute('innerHTML'), 'html.parser')

            # Extract movie details
            title_element = soup_movie.find('h3', class_='ipc-title__text')
            title = title_element.text.split('. ', 1)[1] if title_element and '. ' in title_element.text else title_element.text if title_element else 'N/A'
            
            metadata_items = driver.find_elements(By.CSS_SELECTOR, "ul[data-testid='btp_ml'] li")
            year = metadata_items[0].text if len(metadata_items) > 0 else 'N/A'
            if title in title_count:
                title_count[title].add(year)
                title = f"{title} ({year})"
            else:
                title_count[title] = {year}

            duration = metadata_items[1].text if len(metadata_items) > 1 else 'N/A'
            age_rating = metadata_items[2].text if len(metadata_items) > 2 else 'N/A'
            
            genres_elements = driver.find_elements(By.CSS_SELECTOR, "ul[data-testid='btp_gl'] li")
            genres = ', '.join(['Musical' if genre.text == 'Music' else genre.text for genre in genres_elements]) if genres_elements else 'N/A'
            
            director = ', '.join([director.text for director in soup_movie.find_all('a', class_='ipc-link ipc-link--base dli-director-item')]) if soup_movie.find_all('a', class_='ipc-link ipc-link--base dli-director-item') else 'N/A'
            
            # Collect movie info
            movie_info = {
                'Movie Title': title,
                'Year of Release': year,
                'Duration': duration,
                'Certificate': age_rating,
                'Genre': genres,
                'Director': director
            }
            movies.append(movie_info)

            # Close the popup to reset for the next movie
            close_button = driver.find_element(By.CSS_SELECTOR, "button[title='Close Prompt']")
            driver.execute_script("arguments[0].click();", close_button)

    driver.quit()
    # Save movies data to a CSV file
    with open('data/movies.csv', 'w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=movies[0].keys())
        writer.writeheader()
        writer.writerows(movies)
    
    end_time = time.time()  # End timing
    print(f"Data collection completed. Total execution time: {end_time - start_time:.2f} seconds.")
    return movies

# URL of the IMDb page and the maximum number of movies to fetch
url = 'https://www.imdb.com/list/ls098063263/?view=detailed'
max_movies = 1000  # Set the maximum number of movies you want to collect
movie_details = fetch_movie_data(url, max_movies)


''' Add after
A Clockwork Orange,1971,2h 6min,R,"Crime, Sci-Fi",Stanley Kubrick
The Goonies,1985,1h 54min,PG,"Adventure, Comedy, Family",Richard Donne
Ferris Bueller's Day Off,1986,1h 43min,PG-13,"Comedy, Adventure",John Hughes
The Breakfast Club,1985,1h 37min,R,"Comedy, Drama",John Hughes
The Shining,1980,2h 26min,R,"Horror, Drama",Stanley Kubrick
The Shawshank Redemption,1994,2h 22min,R,"Drama, Thriller, Crime",Frank Darabont
Fight Club,1999,2h 19min,R,"Drama, Action, Sport",David Fincher
Alien,1979,1h 57min,R,"Horror, Sci-Fi",Ridley Scott
Requiem for a Dream,2000,1h 42min,R,"Drama, Thriller, Horror",Darren Aronofsky
Citizen Kane,1941,1h 59min,PG,"Drama, Mystery",Orson Welles
The Godfather Part II,1974,3h 22min,R,"Crime, Drama",Francis Ford Coppola
"The Good, the Bad and the Ugly",1966,2h 58min,R,"Adventure, Drama, Western",Sergio Leone
No Country for Old Men,2007,2h 2min,R,"Crime, Drama, Thriller","Ethan Coen, Joel Coen"
Nightcrawler,2014,1h 57min,R,"Crime, Drama, Thriller",Dan Gilroy
The Terminator,1984,1h 47min,R,"Action, Adventure, Sci-Fi",James Cameron
Groundhog Day,1993,1h 41min,PG,"Comedy, Drama, Fantasy",Harold Ramis
RRR,2022,3h 7min,PG-13,"Action, Adventure, Drama",S.S. Rajamouli
2001: A Space Odyssey,1968,2h 29min,G,"Adventure, Sci-Fi",Stanley Kubrick
Mean Girls,2004,1h 37min,PG-13,"Comedy, Drama",Mark Waters
Deadpool & Wolverine,2024,2h 10min,R,"Action, Comedy, Sci-Fi",Shawn Levy
'''