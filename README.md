README.md (English)
Shared Expenses App
Welcome to the repository for our shared expenses application! This mobile app, built with Expo, helps you manage and divide the costs of any event, gathering, or trip in a fair and equitable way. Unlike other apps, this one is based on proportionality, ensuring each person pays exactly for what they consumed.

Key Features
Proportional Expense Split: Automatically calculates each person's share based on their individual consumption and the total amount spent.

Calendar Integration: Create events directly in your calendar to organize your gatherings and expenses.

Map Integration: Add the event location so everyone knows where to go.

Ticket Photo Upload: Forget about paper receipts. Simply take a picture and upload it to the app to have a digital record of all expenses.

Debt Tracking: The app keeps a clear record of who owes whom, making payments easy and preventing confusion.

Getting Started
To clone and run this project in your development environment, follow these steps:

Clone the repository:

Bash

git clone [Repository URL]
Navigate to the project directory:

Bash

cd [repository_name]
Install the Node dependencies:

Bash

npm install
Or, if you use Yarn:

Bash

yarn install
Make sure the specific Expo dependencies are installed:

Bash

npm install uuid expo-sharing@~13.1.5 expo-file-system@~18.1.11 react-native-svg@15.11.2 expo-image-picker@~16.1.4 @expo/vector-icons@^14.1.0 react-native-paper@4.9.2 react-native-screens@~4.11.1 react-native-chart-kit react-native-safe-area-context@5.4.0 @react-navigation/stack @react-navigation/native @react-native-picker/picker@2.11.1 react-native-gesture-handler@~2.24.0 react-native-get-random-values@~1.11.0 react-native-status-bar-height @react-native-async-storage/async-storage@2.1.2
Start the Expo development server:

Bash

expo start
This will open a new window in your browser with the Expo DevTools. You can use your phone's camera to scan the QR code that appears and open the application on your Android or iOS device, provided you have the Expo Go app installed.
