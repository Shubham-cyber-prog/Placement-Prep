import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, MessageCircle } from "lucide-react";

const StudyGroups = () => {
  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (data.success) setGroups(data.groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const createGroup = async () => {
    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newGroup),
      });
      const data = await response.json();
      if (data.success) {
        setGroups([...groups, data.group]);
        setNewGroup({ name: "", description: "" });
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const joinGroup = async (groupId) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (data.success) {
        fetchGroups(); // Refresh groups
      }
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Study Groups</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Study Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Group Name"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
              />
              <Textarea
                placeholder="Group Description"
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
              />
              <Button onClick={createGroup} className="w-full">
                Create Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card key={group._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {group.name}
                <Badge variant="secondary">
                  <Users className="w-3 h-3 mr-1" />
                  {group.members.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{group.description}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => joinGroup(group._id)}>
                  Join Group
                </Button>
                <Button variant="outline" size="sm">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Discussions
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudyGroups;
