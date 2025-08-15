# SkillSwap - Exchange Skills, Not Money

A modern web application that allows users to exchange skills and knowledge with others in their community. Built with HTML, CSS (Tailwind), and JavaScript with localStorage backend.

## 🌟 Features

### ✅ Fully Functional Features
- **User Authentication**: Sign up, login, and logout functionality
- **Protected Routes**: Must login/signup to access dashboard, profile, and messages
- **Skill Management**: Add, view, and delete skills you offer
- **Skill Requests**: Add and manage skills you want to learn
- **Smart Matching**: Automatic matching based on complementary skills
- **Real-time Messaging**: Full messaging system with conversations
- **User Profiles**: Complete profile pages with user information and skills
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Data Persistence**: All data stored in localStorage (no server required)
- **Search & Filter**: Filter skills by category and type
- **User Ratings**: View user ratings and reviews
- **Notifications**: Toast notifications for user feedback

### 🎨 Modern UI/UX
- Beautiful gradient designs
- Smooth animations and transitions
- Intuitive navigation
- Mobile-first responsive design
- Professional color scheme
- Font Awesome icons

## 🚀 Quick Start

### Option 1: Run Locally (Recommended)
1. **Download the files**:
   - `index.html`
   - `app.js`
   - `README.md`

2. **Open in browser**:
   - Double-click `index.html` or
   - Drag `index.html` into your browser or
   - Use a local server (recommended)

3. **Start using**:
   - The app will automatically initialize with sample data
   - You can sign up with any email/password
   - Or use the sample accounts below

### Option 2: Use Local Server (Best for Development)
```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 👥 Sample Accounts

You can use these pre-loaded accounts to test the app:

### Account 1
- **Email**: john@example.com
- **Password**: password123
- **Location**: New York, NY
- **Rating**: 4.8 (36 reviews)

### Account 2
- **Email**: sarah@example.com
- **Password**: password123
- **Location**: Los Angeles, CA
- **Rating**: 4.9 (42 reviews)

### Account 3
- **Email**: mike@example.com
- **Password**: password123
- **Location**: San Francisco, CA
- **Rating**: 4.7 (28 reviews)

**Note**: These accounts start with no skills or requests. You'll need to add your own skills and requests to test the matching functionality.

## 📱 How to Use

### 1. Getting Started
1. **Sign Up**: Create a new account with your name, email, and location
2. **Add Skills**: Go to Dashboard → "Add New Skill" to list what you can teach
3. **Add Requests**: Go to Dashboard → "Add New Request" to list what you want to learn

### 2. Finding Matches
1. **Dashboard**: View your matches in the "Matches" tab
2. **Explore**: Browse all skills and requests in the "Explore" page
3. **Filter**: Use category and type filters to find specific skills

### 3. Messaging
1. **Start Conversation**: Click "Message" on any user's profile
2. **Chat**: Send and receive messages in real-time
3. **Conversations**: View all your conversations in the Messages page

### 4. Managing Your Profile
1. **Dashboard**: View and manage your skills and requests
2. **Edit/Delete**: Use the edit and delete buttons on your listings
3. **Logout**: Use the dropdown menu in the top-right corner

## 🔧 Technical Details

### Architecture
- **Frontend**: HTML5, CSS3 (Tailwind CSS), Vanilla JavaScript
- **Backend**: localStorage (client-side storage)
- **No Dependencies**: Pure HTML/CSS/JS - no build process needed
- **Responsive**: Mobile-first design with Tailwind CSS

### Data Structure
The app uses localStorage with these keys:
- `skillswap_users`: User accounts and profiles
- `skillswap_skills`: Skills offered and requested
- `skillswap_messages`: Individual messages
- `skillswap_conversations`: Conversation metadata
- `skillswap_currentUser`: Currently logged-in user

### Browser Compatibility
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ❌ Internet Explorer (not supported)

## 🔥 Firebase Integration (Optional)

If you want to use Firebase instead of localStorage for a production app:

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "skillswap-app")
4. Choose whether to enable Google Analytics
5. Click "Create project"

### Step 2: Enable Services
1. **Authentication**: 
   - Go to Authentication → Sign-in method
   - Enable Email/Password
   - Optionally enable Google, Facebook, etc.

2. **Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in test mode" (for development)
   - Select a location

3. **Storage** (optional for profile pictures):
   - Go to Storage
   - Click "Get started"
   - Choose "Start in test mode"

### Step 3: Get Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (</>)
4. Register your app with a nickname
5. Copy the configuration object

### Step 4: Update Code
Replace the localStorage functions in `app.js` with Firebase equivalents:

```javascript
// Initialize Firebase
const firebaseConfig = {
  // Your config here
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Example: Replace localStorage with Firestore
async function addSkill(title, category, description, location) {
  if (!currentUser) return;
  
  try {
    await db.collection('skills').add({
      userId: currentUser.uid,
      title: title,
      category: category,
      description: description,
      location: location,
      type: 'offering',
      createdAt: new Date(),
      rating: 0
    });
    
    showNotification('Skill added successfully!', 'success');
  } catch (error) {
    showNotification('Error adding skill', 'error');
  }
}
```

### Firebase Pricing
- **Free Tier**: 
  - 1GB storage
  - 50,000 reads/day
  - 20,000 writes/day
  - 20,000 deletes/day
  - 1GB downloaded/day
  - Perfect for small to medium apps

- **Paid Plans**: 
  - Pay-as-you-go after free tier
  - Very affordable for most use cases

## 🛠️ Customization

### Colors
The app uses Tailwind CSS classes. To change colors:
1. Edit the color classes in `index.html`
2. Common colors: `indigo`, `purple`, `blue`, `green`, `red`, `yellow`

### Categories
To add/modify skill categories:
1. Update the category options in the modals
2. Update the `getCategoryDisplayName()` and `getCategoryColor()` functions in `app.js`

### Sample Data
To modify the initial sample data:
1. Edit the `initializeData()` function in `app.js`
2. Clear localStorage and refresh to see changes

## 🐛 Troubleshooting

### Common Issues

**App not loading properly:**
- Check browser console for errors
- Ensure all files are in the same directory
- Try using a local server instead of file:// protocol

**Data not persisting:**
- Check if localStorage is enabled in your browser
- Clear browser cache and try again
- Check browser console for storage errors

**Messages not working:**
- Ensure you're logged in
- Check if the conversation exists
- Refresh the page and try again

**Mobile issues:**
- Ensure viewport meta tag is present
- Test on different mobile browsers
- Check responsive design breakpoints

### Browser Console Errors
If you see errors in the browser console:
1. **CORS errors**: Use a local server instead of file://
2. **localStorage errors**: Check if private browsing is enabled
3. **JavaScript errors**: Check for syntax errors in app.js

## 📈 Future Enhancements

### Planned Features
- [ ] Real-time notifications
- [ ] Video/audio calling
- [ ] File sharing in messages
- [ ] Skill verification system
- [ ] Advanced search with location
- [ ] Review and rating system
- [ ] Payment integration (optional)
- [ ] Mobile app (React Native)

### Technical Improvements
- [ ] Progressive Web App (PWA)
- [ ] Offline support
- [ ] Data export/import
- [ ] Advanced analytics
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you need help:
1. Check the troubleshooting section above
2. Look for similar issues in the browser console
3. Try clearing localStorage and starting fresh
4. Contact support with specific error messages

---

**Made with ❤️ for the skill-sharing community**
