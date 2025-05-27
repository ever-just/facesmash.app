
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Eye, Search, Shield } from "lucide-react";
import { AdminUserData } from "@/services/adminService";

interface AdminUserTableProps {
  users: AdminUserData[];
  onDeleteUser: (userId: string, userEmail: string) => void;
}

const AdminUserTable = ({ users, onDeleteUser }: AdminUserTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Eye className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription className="text-gray-400">
          Manage all registered users and their access
        </CardDescription>
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Email</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Total Logins</TableHead>
                <TableHead className="text-gray-300">Success Rate</TableHead>
                <TableHead className="text-gray-300">Face Scans</TableHead>
                <TableHead className="text-gray-300">Last Login</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-gray-700">
                  <TableCell className="text-white flex items-center gap-2">
                    {user.email}
                    {user.is_admin && (
                      <Badge variant="secondary" className="bg-blue-600 text-white">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.total_logins > 0 ? "default" : "secondary"}
                      className={user.total_logins > 0 ? "bg-green-600 text-white" : "bg-gray-600 text-gray-300"}
                    >
                      {user.total_logins > 0 ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">{user.total_logins || 0}</TableCell>
                  <TableCell className="text-gray-300">
                    {user.total_logins > 0 
                      ? `${Math.round((user.successful_logins || 0) / user.total_logins * 100)}%`
                      : "N/A"
                    }
                  </TableCell>
                  <TableCell className="text-gray-300">{user.total_scans}</TableCell>
                  <TableCell className="text-gray-300 text-sm">
                    {formatDate(user.last_login)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteUser(user.id, user.email)}
                        disabled={user.is_admin}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              {searchTerm ? "No users found matching your search." : "No users found."}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminUserTable;
