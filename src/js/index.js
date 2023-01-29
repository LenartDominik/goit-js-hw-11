import { Notify } from 'notiflix/build/notiflix-notify-aio';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('form#search-form');
const gallery = document.querySelector('div.gallery');
const moreBtn = document.querySelector('button.load-more');
const switchBox = document.querySelector('.onoffswitch>input');

let page = 1;
const limitPerPage = 40;
let searchValue = '';
let isPrinted = false;
let limitReached = false;

const params = new URLSearchParams({
  key: '33214454-ae922a6a5ae9b73ef58c0c979',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
  per_page: limitPerPage,
});

const clearGallery = () => {
  gallery.innerHTML = '';
  isPrinted = false;
  window.scroll(0, 0);
};

const buildGallery = arr => {
  arr.forEach(el => {
    const markup = `<div class="photo-card">
      <a href="${el.largeImageURL}">
      <img src="${el.webformatURL}" alt="${el.tags}" loading="lazy" />
      </a>
      <div class="info">
      <p class="info-item">
      <b>Likes</b> ${el.likes} 
      </p>
      <p class="info-item">
      <b>Views</b> ${el.views}
      </p>
      <p class="info-item">
      <b>Comments</b> ${el.comments}
      </p>
      <p class="info-item">
      <b>Downloads</b> ${el.downloads}
      </p>
      </div>
      </div>`;
    gallery.innerHTML += markup;
    isPrinted = true;
    lightbox.refresh();
  });
};

const disableBtn = () => {
  moreBtn.classList.add('hidden');
};
const enableBtn = () => {
  moreBtn.classList.remove('hidden');
};

const loadPage = () => {
  disableBtn();
  switchBox.checked = localStorage.getItem('toggle') === 'true' ? true : false;
};

const fetchImg = async search => {
  const response = await axios.get(
    `https://pixabay.com/api/?${params}&q=${search}&page=${page}`
  );
  return response.data;
};

const searchImg = event => {
  page = 1;
  limitReached = false;
  event.preventDefault();
  searchValue = event.target[0].value;
  disableBtn();
  clearGallery();
  fetchImg(searchValue)
    .then(arr => {
      if (arr.hits.length === 0) {
        disableBtn();
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        Notify.success(`Hooray! We found ${arr.totalHits} images.`);
        buildGallery(arr.hits);
        page++;
        limitReached = arr.totalHits < limitPerPage;
        if (!switchBox.checked) {
          enableBtn();
        }
      }
    })

    .catch(error => Notify.failure(error.response.data));
};

const loadMore = () => {
  if (limitReached) {
    Notify.info(`We're sorry, but you've reached the end of search results.`);
    disableBtn();
    return;
  }
  fetchImg(searchValue)
    .then(arr => {
      limitReached = page * limitPerPage > arr.totalHits;
      buildGallery(arr.hits);
      scroll();
      page++;
    })
    .catch(error => Notify.failure(error.response.data));
};

window.addEventListener('load', loadPage);
searchForm.addEventListener('submit', searchImg);
moreBtn.addEventListener('click', loadMore);

let lightbox = new SimpleLightbox('.photo-card a', {
  captions: false,
  showCounter: false,
});

function scroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 3,
    behavior: 'smooth',
  });
}

switchBox.addEventListener('change', () => {
  localStorage.setItem('toggle', switchBox.checked);
  if (switchBox.checked) {
    disableBtn();
  } else {
    if (isPrinted) {
      enableBtn();
    }
  }
});

window.addEventListener('scroll', () => {
  if (
    window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight &&
    switchBox.checked
  ) {
    loadMore();
  }
});
