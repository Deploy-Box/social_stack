const io = require('socket.io-client');

// Connect to the backend
const socket = io('http://localhost:3000');

const conversationId = process.argv[2];

if (!conversationId) {
    console.error('Please provide a conversation ID as an argument.');
    console.error('Usage: node verify_socket.js <conversationId>');
    process.exit(1);
}

socket.on('connect', () => {
    console.log('✅ Connected to Socket.IO server');
    
    // Join the conversation room
    console.log(`Joining conversation: ${conversationId}`);
    socket.emit('join_conversation', conversationId);
});

socket.on('new_message', (message) => {
    console.log('\n📩 RECEIVED NEW MESSAGE:');
    console.log(JSON.stringify(message, null, 2));
    console.log('\n✅ Verification Successful: Real-time event received!');
    // process.exit(0); // Keep running to see more or manually exit
});

socket.on('disconnect', () => {
    console.log('❌ Disconnected from server');
});

console.log('Waiting for messages... (Press Ctrl+C to exit)');
