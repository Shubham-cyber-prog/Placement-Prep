export const setupGroupSockets = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected for groups:', socket.id);

    // Group join/leave events
    socket.on('group:join', (groupId) => {
      socket.join(`group:${groupId}`);
      console.log(`User ${socket.id} joined group ${groupId}`);
      socket.to(`group:${groupId}`).emit('group:member_joined', {
        userId: socket.id,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('group:leave', (groupId) => {
      socket.leave(`group:${groupId}`);
      console.log(`User ${socket.id} left group ${groupId}`);
      socket.to(`group:${groupId}`).emit('group:member_left', {
        userId: socket.id,
        timestamp: new Date().toISOString()
      });
    });

    // Group messaging
    socket.on('group:message', (data) => {
      const { groupId, message, userName } = data;
      console.log(`Group ${groupId} message from ${userName}:`, message);
      socket.to(`group:${groupId}`).emit('group:new_message', {
        message,
        userId: socket.id,
        userName,
        timestamp: new Date().toISOString()
      });
    });

    // Typing indicators
    socket.on('group:typing_start', (data) => {
      const { groupId, userName } = data;
      socket.to(`group:${groupId}`).emit('group:user_typing', {
        userName,
        isTyping: true
      });
    });

    socket.on('group:typing_stop', (data) => {
      const { groupId, userName } = data;
      socket.to(`group:${groupId}`).emit('group:user_typing', {
        userName,
        isTyping: false
      });
    });

    // Group study session
    socket.on('group:session_start', (data) => {
      const { groupId, sessionId, userName } = data;
      socket.join(`session:${sessionId}`);
      socket.to(`group:${groupId}`).emit('group:session_started', {
        sessionId,
        startedBy: userName,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('group:session_join', (sessionId) => {
      socket.join(`session:${sessionId}`);
      socket.to(`session:${sessionId}`).emit('group:session_user_joined', {
        userId: socket.id
      });
    });

    // WebRTC signaling
    socket.on('webrtc:offer', (data) => {
      const { to, offer } = data;
      socket.to(to).emit('webrtc:offer', {
        from: socket.id,
        offer
      });
    });

    socket.on('webrtc:answer', (data) => {
      const { to, answer } = data;
      socket.to(to).emit('webrtc:answer', {
        from: socket.id,
        answer
      });
    });

    socket.on('webrtc:ice-candidate', (data) => {
      const { to, candidate } = data;
      socket.to(to).emit('webrtc:ice-candidate', {
        from: socket.id,
        candidate
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from groups:', socket.id);
    });
  });
};