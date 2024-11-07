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
      <div class="blog-card-description">
          <h2>{{ post.title }}</h2>
          <p><small>{{ post.date | date: "%B %d, %Y" }}</small></p>
          <p>{{ post.description }}</p>
          <div class="blog-card-link-wrap">
              <a href="{{ post.url }}" class="blog-card-link">Read more</a>
          </div>
      </div>
    </div>
  {% endfor %}
</div>

