interface SignOutButtonProps {
  onSignOut: () => void;
}

export function SignOutButton({ onSignOut }: SignOutButtonProps) {
  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onSignOut();
  };

  return (
    <button 
      onClick={handleSignOut}
      className="bg-white/10 text-white py-2 px-4 rounded-lg hover:bg-white/20 transition-all"
    >
      Sign Out
    </button>
  );
}