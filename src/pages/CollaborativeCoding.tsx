import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, Video, Mic, MicOff, VideoOff, MessageCircle, Send } from "lucide-react";
import { io } from "socket.io-client";
import Peer from "peerjs";

const CollaborativeCoding = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [code, setCode] = useState("// Start coding here...");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [participants, setParticipants] = useState([]);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSession, setNewSession] = useState({ title: "", description: "" });

  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    fetchSessions();
    initializeSocket();
    initializePeer();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (peerRef.current) peerRef.current.destroy();
    };
  }, []);

  const initializeSocket = () => {
    socketRef.current = io("http://localhost:5000");

    socketRef.current.on('codeUpdate', (data) => {
      setCode(data.code);
    });

    socketRef.current.on('messageReceived', (data) => {
      setMessages(prev => [...prev, data]);
    });

    socketRef.current.on('userJoined', (data) => {
      setParticipants(prev => [...prev, data.userId]);
    });

    socketRef.current.on('userLeft', (data) => {
      setParticipants(prev => prev.filter(id => id !== data.userId));
    });
  };

  const initializePeer = () => {
    peerRef.current = new Peer();

    peerRef.current.on('open', (id) => {
      console.log('My peer ID is: ' + id);
    });

    peerRef.current.on('call', (call) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          call.answer(stream);
          call.on('stream', (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });
        });
    });
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (data.success) setSessions(data.sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const createSession = async () => {
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newSession),
      });
      const data = await response.json();
      if (data.success) {
        setSessions([...sessions, data.session]);
        setNewSession({ title: "", description: "" });
        setIsCreateDialogOpen(false);
        joinSession(data.session.roomId);
      }
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const joinSession = (roomId) => {
    const session = sessions.find(s => s.roomId === roomId);
    setCurrentSession(session);
    setParticipants([socketRef.current.id]);
    socketRef.current.emit('joinSession', roomId);
  };

  const leaveSession = () => {
    if (currentSession) {
      socketRef.current.emit('leaveSession', currentSession.roomId);
      setCurrentSession(null);
      setParticipants([]);
      setMessages([]);
      setCode("// Start coding here...");
    }
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (currentSession) {
      socketRef.current.emit('codeChange', { roomId: currentSession.roomId, code: newCode });
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && currentSession) {
      socketRef.current.emit('sendMessage', { roomId: currentSession.roomId, message: newMessage });
      setNewMessage("");
    }
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    // Implement video toggle logic
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    // Implement audio toggle logic
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Collaborative Coding</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Users className="w-4 h-4 mr-2" />
              Create Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Coding Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Session Title"
                value={newSession.title}
                onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
              />
              <Textarea
                placeholder="Session Description"
                value={newSession.description}
                onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
              />
              <Button onClick={createSession} className="w-full">
                Create Session
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!currentSession ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <Card key={session._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {session.title}
                  <Badge variant="secondary">
                    <Users className="w-3 h-3 mr-1" />
                    {session.participants.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{session.description}</p>
                <Button onClick={() => joinSession(session.roomId)} className="w-full">
                  Join Session
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Code Editor */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {currentSession.title}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={toggleVideo}>
                      {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={toggleAudio}>
                      {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={leaveSession}>
                      Leave Session
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  className="min-h-[400px] font-mono"
                  placeholder="Start coding..."
                />
              </CardContent>
            </Card>
          </div>

          {/* Chat and Participants */}
          <div className="space-y-6">
            {/* Video Chat */}
            <Card>
              <CardHeader>
                <CardTitle>Video Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <video ref={videoRef} className="w-full h-32 bg-gray-200 rounded" autoPlay muted />
                  <video ref={remoteVideoRef} className="w-full h-32 bg-gray-200 rounded" autoPlay />
                </div>
              </CardContent>
            </Card>

            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle>Participants ({participants.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {participants.map((participant, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                        {participant.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm">{participant}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat */}
            <Card>
              <CardHeader>
                <CardTitle>Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-64 overflow-y-auto space-y-2">
                    {messages.map((message, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-semibold">{message.userId.slice(0, 4)}:</span> {message.message}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <Button onClick={sendMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborativeCoding;
