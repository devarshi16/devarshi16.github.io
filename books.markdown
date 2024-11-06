---
layout: page
title: Books
permalink: /books/
---

<div class="books-section">
  {% for book in site.mybooks %}
    <div class="book-card">
      <div class="book-card-image">
        <img src="{{ book.image }}" alt="{{ book.title }}">
      </div>
      <div class="book-card-content">
        <h2>{{ book.title }}</h2>
        <p>{{ book.description }}</p>
        <a href="{{ book.book_url }}" class="book-card-link">Read more</a>
      </div>
    </div>
  {% endfor %}
</div>

