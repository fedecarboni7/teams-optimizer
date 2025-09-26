# Frontend Maintenance Guidelines

## Overview
This document provides simple guidelines for maintaining clean and organized frontend code in the Teams Optimizer project.

## Project Structure

### Templates Organization
```
templates/
├── base.html              # Base template with common elements
├── _sidebar.html          # Sidebar component (reusable)
├── _navbar.html           # Navigation bar component
├── _modals.html           # Common modal components
├── players.html           # Players page (extends base.html)
├── clubs.html             # Clubs page (extends base.html)
└── ...                    # Other page templates
```

### JavaScript Organization
```
static/js/
├── common.js              # Shared functionality (sidebar, navigation)
├── ui.js                  # General UI functions
├── api.js                 # API communication
├── players.js             # Players page specific code
├── clubs.js               # Clubs page specific code
└── ...                    # Other page-specific scripts
```

### CSS Organization
```
static/css/
├── base.css               # Core styles, colors, typography
├── layout.css             # Layout and grid systems
├── components.css         # Reusable components (buttons, cards)
├── pages.css              # Page-specific styles
├── sidebar.css            # Sidebar specific styles
├── players.css            # Players page styles
└── ...                    # Other specialized stylesheets
```

## Daily Maintenance Routine

### Before Making Changes
1. **Identify the scope**: Are you working on HTML, CSS, or JavaScript?
2. **Open only relevant files**: Don't open the entire project if you're just fixing a button style
3. **Check existing patterns**: Look for similar functionality before creating new code

### While Editing

#### HTML Templates
- **Use base template**: New pages should extend `base.html`
- **Reuse components**: Use `_sidebar.html`, `_navbar.html`, `_modals.html` when possible
- **URL helpers**: Always use `{{ url_for('static', filename='...') }}` for static assets
- **Block structure**: Use appropriate blocks (`{% block content %}`, `{% block page_css %}`, etc.)

#### JavaScript
- **Common functions**: Add shared functionality to `common.js`
- **Page-specific code**: Keep page-specific code in dedicated files (e.g., `players.js`)
- **Event listeners**: Use `document.addEventListener('DOMContentLoaded', ...)` instead of inline handlers
- **Error handling**: Use `try/catch` blocks and `showError()` function for consistent error handling

#### CSS
- **Component naming**: Use clear prefixes like `sidebar-`, `player-`, `modal-` for related styles
- **Avoid duplication**: If you're copying styles, consider creating a reusable component class
- **Variables**: Use CSS custom properties for colors and repeated values:
  ```css
  :root {
      --primary-color: #1a73e8;
      --border-radius: 8px;
  }
  ```

### After Making Changes
1. **Test functionality**: 
   - Sidebar opens/closes correctly
   - Buttons work as expected
   - Navigation between pages works
   - No console errors

2. **Check consistency**:
   - Naming follows existing patterns
   - No duplicate CSS rules
   - JavaScript functions are in appropriate files

3. **Quick review**:
   - Does the HTML validate?
   - Are there any broken links or missing assets?
   - Do colors and spacing look consistent?

## Quick Fixes Checklist

### When Adding a New Page
- [ ] Extend `base.html`
- [ ] Set appropriate `active_page` variable
- [ ] Define `body_class` if needed
- [ ] Use `url_for()` for all static assets
- [ ] Include page-specific CSS in `{% block page_css %}`
- [ ] Include page-specific JS in `{% block page_js %}`

### When Adding a New Component
- [ ] Check if similar component exists
- [ ] Create reusable CSS class
- [ ] Document any JavaScript requirements
- [ ] Test component in different pages

### When Fixing a Bug
- [ ] Identify if it's a global or page-specific issue
- [ ] Check browser console for errors
- [ ] Test fix in multiple browsers if possible
- [ ] Ensure fix doesn't break other pages

## Common Patterns

### Adding a New Modal
```html
<!-- In your template -->
{% block modals %}
<div id="myModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2 class="modal-title">My Modal</h2>
            <button class="close-btn" onclick="closeMyModal()">&times;</button>
        </div>
        <div class="modal-body">
            <!-- Modal content -->
        </div>
    </div>
</div>
{% endblock %}
```

### Adding Navigation
```javascript
// In common.js or page-specific file
function navigateToCustomPage() {
    window.location.href = '/custom-route';
}
```

### Adding Reusable Styles
```css
/* In components.css */
.btn-primary {
    background-color: var(--primary-color);
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
}

.btn-primary:hover {
    background-color: var(--primary-color-dark);
}
```

## File Organization Tips

1. **Keep related code together**: Page-specific styles, scripts, and templates should reference each other clearly
2. **Use descriptive names**: `player-list-container` is better than `container-1`
3. **Group by functionality**: Navigation code goes in navigation files, modal code in modal files
4. **Avoid deep nesting**: Keep template blocks and CSS selectors as flat as possible

## When You're Stuck

1. **Look for similar examples**: Check how other pages solve similar problems
2. **Check the console**: Browser developer tools often show exactly what's wrong
3. **Test with simple cases**: If a complex feature isn't working, try a simpler version first
4. **Use the components**: Don't reinvent buttons, modals, or navigation - reuse existing components

## Performance Tips

1. **Load scripts efficiently**: Use `defer` attribute for non-critical JavaScript
2. **Minimize CSS**: Don't load page-specific CSS on every page
3. **Optimize images**: Use appropriate formats and sizes
4. **Test on slower connections**: Check that pages load reasonably on slow networks

---

Remember: **Simple and consistent is better than complex and perfect.** Focus on maintainability and readability over optimization until you need it.