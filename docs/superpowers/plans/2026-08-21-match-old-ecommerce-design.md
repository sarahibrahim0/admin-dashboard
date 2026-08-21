# Match Old E-Commerce Design Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement task-by-task.

**Goal:** Make both ecommerce-v2 and admin-dashboard-v2 match the old project's salmon/almond/blue-black PrimeNG design.

**Old project location:** `D:\E-Commerce\E-Commerce\E-Commerce`

---

## Old Project Design Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| salmon | #FD8F5F | Primary: buttons, links, prices, ratings |
| almond | #F2E1D9 | Nav bg, sidebar, sections |
| dark-purple | #680F18 | Product prices |
| blue-black | #1D2547 | Footer bg, nav text, headings |
| body-gray | #646D77 | Body text |
| heading | #1a1a1a | Main headings |
| error | #ff4545 | Form validation |
| hover-salmon | #e9855a | Button hover |
| border-light | #c9c9c9 | Input borders |

**Key patterns:** Square corners (border-radius 0), UPPERCASE headings/buttons, letter-spacing 1px, fadeInUp animations, Bootstrap Icons, Poppins font, PrimeNG with global overrides.

---

## Part 1: Admin Dashboard (6 tasks)

### Task 1: Install PrimeNG + Bootstrap Icons + Poppins + configure theme
- Install: primeng, @primeng/themes, primeicons, bootstrap-icons
- Add to angular.json styles: Aura theme CSS, primeng.min.css, bootstrap-icons.css
- Rewrite styles.css: add @theme color tokens (salmon, almond, blue-black etc), Poppins font, scrollbar styling, fadeInUp keyframe, PrimeNG overrides (square buttons, salmon ratings)
- Add Poppins font link to index.html
- Commit

### Task 2: Update sidebar colors
- bg-white → bg-almond, text-slate-* → text-blue-black, active: bg-white text-salmon
- hover:bg-slate-100 → hover:bg-[#ecd7cd]
- Commit

### Task 3: Update topbar colors
- bg-white → bg-almond, text-slate-* → text-blue-black
- Logout button: bg-salmon uppercase
- Commit

### Task 4: Update login page
- bg-slate-50 → bg-almond, bg-salmon button, text-[#140C40] headings
- border-[#c9c9c9] inputs, text-[#646D77] body
- Commit

### Task 5: Global color replacement across ALL admin pages
- indigo-600 → salmon, indigo-700 → #e9855a, indigo-50 → #F6F8FE
- slate-900 → blue-black, slate-700/600 → #646D77, slate-500 → #797979
- slate-200 → #F6F8FE, slate-300 → #c9c9c9, slate-50 → almond, slate-100 → #ecd7cd
- rose-600/700 → #ff4545, rose-50 → #fff5f5
- Add uppercase tracking-wider to headings and buttons
- Commit

### Task 6: Build verification
- ng build, fix errors, commit

## Part 2: E-Commerce Storefront (6 tasks)

### Task 7: Install PrimeNG + Bootstrap Icons in ecommerce-v2
- Same as Task 1 but for ecommerce-v2
- Commit

### Task 8: Update styles.css
- Same @theme tokens, same global styles, same PrimeNG overrides
- Commit

### Task 9: Update header/nav component
- bg-white/95 → bg-almond, text-slate-600 → text-blue-black
- Logo: text-salmon, nav active: text-salmon
- Search button: bg-salmon
- Cart badge: bg-salmon
- Commit

### Task 10: Update footer component
- bg-slate-50 → bg-blue-black, text-slate-500 → text-link-gray
- Links: hover:text-salmon
- Commit

### Task 11: Update home, login, register, product pages
- Hero: bg-gradient from almond to white
- Buttons: bg-salmon, hover:bg-[#e9855a], uppercase, square corners
- Product cards: border-[#F6F8FE], price text-salmon
- Headings: text-heading uppercase font-bold
- Body: text-body-gray
- Commit

### Task 12: Build verification
- ng build, fix errors, commit
