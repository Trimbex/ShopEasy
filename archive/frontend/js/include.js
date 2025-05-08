// js/include.js
document.addEventListener('DOMContentLoaded', function() {
    // Load all HTML includes
    loadIncludes();
    
    // Initialize dark mode and cart badge after includes are loaded
    function initializeAfterIncludes() {
      // Setup dark mode toggle
      const darkModeToggle = document.getElementById('darkModeToggle');
      if (darkModeToggle) {
        darkModeToggle.checked = localStorage.getItem('darkMode') === 'true';
        setDarkMode(darkModeToggle.checked);
        darkModeToggle.addEventListener('change', function() {
          setDarkMode(this.checked);
        });
      }
      
      // Update cart badge
      updateCartNav();
    }
    
    function loadIncludes() {
      const includes = document.getElementsByTagName('include');
      let loadedCount = 0;
      const totalIncludes = includes.length;
      
      if (totalIncludes === 0) {
        // No includes found, just initialize
        initializeAfterIncludes();
        return;
      }
      
      Array.from(includes).forEach(function(include) {
        const file = include.getAttribute('src');
        fetch(file)
          .then(response => response.text())
          .then(html => {
            const div = document.createElement('div');
            div.innerHTML = html;
            
            // Replace the include tag with the content
            while (div.firstChild) {
              include.parentNode.insertBefore(div.firstChild, include);
            }
            include.remove();
            
            // Check if all includes are loaded
            loadedCount++;
            if (loadedCount === totalIncludes) {
              initializeAfterIncludes();
            }
          })
          .catch(error => {
            console.error(`Error loading include file ${file}:`, error);
            include.innerHTML = `<div class="alert alert-danger">Error loading ${file}</div>`;
            
            // Still count this include as processed
            loadedCount++;
            if (loadedCount === totalIncludes) {
              initializeAfterIncludes();
            }
          });
      });
    }
  });