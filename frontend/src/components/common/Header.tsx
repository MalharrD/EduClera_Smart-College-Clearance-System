import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { GraduationCap, Menu, X, LogOut, User } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { clearanceWorkflow } from '@/services/storage';
import { useToast } from '@/hooks/use-toast';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();

  const hideHeaderPaths = ['/login', '/register', '/staff-access', '/staff-roles', '/staff-login'];
  const shouldHideHeader = hideHeaderPaths.some(path => location.pathname.startsWith(path));

  if (shouldHideHeader) {
    return null;
  }

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged Out',
      description: 'You have been logged out successfully.',
    });
    navigate('/login');
  };

  const getNavigationLinks = () => {
    if (!isAuthenticated || !user) {
      return [];
    }

    const links = [];

    if (user.role === 'student') {
      links.push(
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/submit-request', label: 'Submit Request' },
        { path: '/track-status', label: 'Track Status' }
      );
    } else if (user.role === 'admin') {
      links.push(
        { path: '/admin/dashboard', label: 'Dashboard' },
        { path: '/admin/users', label: 'User Management' },
        { path: '/admin/reports', label: 'Reports' }
      );
    } else if (user.role === 'hod') {
      links.push(
        { path: '/hod/dashboard', label: 'HOD Dashboard' },
        { path: '/department/requests', label: 'Pending Requests' }
      );
    } else {
      links.push(
        { path: '/department/dashboard', label: 'Dashboard' },
        { path: '/department/requests', label: 'Pending Requests' }
      );
    }

    return links;
  };

  const navigationLinks = getNavigationLinks();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-4">
            <img 
              src="https://miaoda-conversation-file.s3cdn.medo.dev/user-845wqo7mn94w/conv-845wum9wqhog/20251210/file-852rchre4v0g.png" 
              alt="DKTE Logo" 
              className="h-10 w-auto object-contain"
            />
            <div className="h-8 w-px bg-border hidden sm:block" />
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-foreground">EduClera</span>
            </Link>
          </div>

          {isAuthenticated && (
            <>
              <div className="hidden md:flex items-center gap-6">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      location.pathname === link.path
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {clearanceWorkflow.getDepartmentLabel(user.role)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>

              <div className="md:hidden flex items-center">
                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col gap-4 mt-6">
                      <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
                        <div className="bg-primary text-primary-foreground p-2 rounded-full">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {clearanceWorkflow.getDepartmentLabel(user.role)}
                          </p>
                        </div>
                      </div>

                      {navigationLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            location.pathname === link.path
                              ? 'text-primary bg-primary/10'
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                          }`}
                        >
                          {link.label}
                        </Link>
                      ))}

                      <Button variant="outline" onClick={handleLogout} className="mt-4">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

