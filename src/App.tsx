export default function App() {
  return <h1>Hello App Works</h1>;
}
// import { useAuth } from './contexts/AuthContext';
// import Auth from './components/Auth';
// import Dashboard from './components/Dashboard';

// function AppContent() {
//   const { user, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return user ? <Dashboard /> : <Auth />;
// }

// export default function App() {
//   return <AppContent />;
// }
