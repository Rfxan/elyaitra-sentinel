// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { Mail, ArrowLeft } from "lucide-react";

// const ForgotPassword = () => {
//   const [email, setEmail] = useState("");

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     // UI only - no logic
//   };

//   return (
//     <div className="dark min-h-screen bg-background flex items-center justify-center px-4 py-12">
//       {/* Background effects */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
//       </div>

//       <div className="relative z-10 w-full max-w-md">
//         {/* Logo */}
//         <div className="text-center mb-8">
//           <Link to="/" className="text-3xl font-bold text-white">
//             ELYAITRA
//           </Link>
//         </div>

//         {/* Glass card */}
//         <div className="glass-dark rounded-3xl p-8">
//           <div className="text-center mb-8">
//             <h1 className="text-2xl font-bold text-white mb-2">Reset Your Password</h1>
//             <p className="text-muted-foreground">
//               Enter your email and we'll send you a reset link
//             </p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-5">
//             {/* Email field */}
//             <div className="space-y-2">
//               <label className="text-sm font-medium text-white">Email</label>
//               <div className="relative">
//                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="you@example.com"
//                   className="w-full pl-12 pr-4 py-3 rounded-xl bg-background/50 border border-border text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
//                 />
//               </div>
//             </div>

//             {/* Submit button */}
//             <button
//               type="submit"
//               className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold glow-primary hover:glow-primary-hover hover:brightness-110 active:scale-[0.98] transition-all"
//             >
//               Send Reset Link
//             </button>
//           </form>

//           {/* Back to login */}
//           <div className="mt-6 text-center">
//             <Link
//               to="/login"
//               className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
//             >
//               <ArrowLeft className="w-4 h-4" />
//               Back to Sign In
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;
