---
layout: default
title: "Blog"
---

<div class="blog-section">
  {% for post in site.blogs %}
    <div class="blog-card">
      <div class="blog-card-image">
        <img src="{{ post.thumbnail }}" alt="{{ post.title }}">
      </div>
      <div class="blog-card-content">
        <h2>{{ post.title }}</h2>
        <p><small>{{ post.date | date: "%B %d, %Y" }}</small></p>
        <p>{{ post.description }}</p>
        <p class="tags">
          Tags: 
          {% for tag in post.tags %}
            <a href="/tags/{{ tag | slugify }}/" class="tag">{{ tag }}</a>
          {% endfor %}
        </p> 
        <a href="{{ post.url }}" class="blog-card-link">Read more</a>
      </div>
    </div>
  {% endfor %}
</div>
