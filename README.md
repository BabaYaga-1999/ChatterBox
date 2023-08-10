Team members:
Yucheng Wang
Xiangyuan Ding


npm install --save react-native-swipeout 
npm install --save react-native-swipe-list-view

Description: We use 3 collections in our project: chats, posts and users.
chats: 
It stores all chat sessions. Each session represents a chat room between two users. A session includes a collection called "messages" and a doc. 
    The collection "messages" stores all messages and their relevant information. Each message is a doc that includes three fields: createdAt, text and userId.
    The doc stores information about the chat room in general. It includes 5 fields: deleteBy(who deleted this chat on their device), lastMessage, lastMessageTime, members(a list of two users) and pinned(boolean).

posts:
It stores all posts that user sent. Each post has three fields: title, gps and description. Title is the title of the post. Gps is the location where this post is created. Description is the content of the post.

users:
It stores all users. Each user has three fields: email, friends(friend list) and name. More fields such as avatar and preferences will be added.