Team members:
Yucheng Wang
Xiangyuan Ding

To activate firebase API:
https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=594470574078

In EntryList.js:
else if (type === 'over-limit') {
    const q = query(collection(db, 'entries'), where('overLimit', '==', true));
    ...}
// cannot use where('calories', '>', 500) cause marking as reviewed will not be reflected

use onSnapshot() instead of get() to listen to realtime updates from firestore. The snapshot handler will receive a new query snapshot every time the query results change (when a document is added, removed, or modified).

