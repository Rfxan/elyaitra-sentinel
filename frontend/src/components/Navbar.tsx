import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Shield } from "lucide-react";
import GetStartedButton from "./GetStartedButton";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthPage = ["/login", "/signup", "/forgot-password"].includes(
    location.pathname
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isAuthPage) return null;

  // ✅ SUBJECTS ENTRY RULE
  const handleSubjectsClick = () => {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
      navigate("/signup");
      return;
    }

    navigate("/subjects");
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6 py-4">
      <div className="max-w-6xl mx-auto">
        <div
          className={cn(
            "flex items-center justify-between rounded-full px-4 sm:px-6 py-2.5 transition-all duration-500",
            "bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]",
            "shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
            scrolled &&
              "bg-white/[0.06] border-white/[0.12] shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
          )}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/elyaltra-text-logo.png"
              alt="Elyaitra"
              className="h-9 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 bg-white/[0.03] rounded-full px-2 py-1">
            <a
              href="#features"
              className="px-4 py-1.5 text-sm font-medium rounded-full text-white/60 hover:text-white hover:bg-white/[0.05]"
            >
              Features
            </a>

            <button
              onClick={handleSubjectsClick}
              className="px-4 py-1.5 text-sm font-medium rounded-full text-white/60 hover:text-white hover:bg-white/[0.05]"
            >
              Subjects
            </button>

            <Link
              to="/sentinel"
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full text-cyan-400 hover:bg-white/[0.05] transition-all"
            >
              <Shield size={14} /> SentinelML
            </Link>
          </div>

          {/* Right */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium rounded-full text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              Sign In
            </Link>
            <GetStartedButton />
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-white/70 hover:text-white hover:bg-white/[0.05]"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            mobileMenuOpen ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
          )}
        >
          <div className="rounded-2xl p-4 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]">
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSubjectsClick();
                }}
                className="px-4 py-3 text-sm font-medium rounded-xl text-white/70 hover:text-white hover:bg-white/[0.05]"
              >
                Subjects
              </button>

              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-sm font-medium rounded-xl text-white/70 hover:text-white hover:bg-white/[0.05]"
              >
                Features
              </a>

              <Link
                to="/sentinel"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-sm font-medium rounded-xl text-cyan-400 hover:bg-white/[0.05]"
              >
                SentinelML
              </Link>

              <hr className="my-2 border-white/10" />

              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-sm font-medium rounded-xl text-center text-white/70 hover:text-white hover:bg-white/[0.05]"
              >
                Sign In
              </Link>

              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-sm font-semibold rounded-xl text-center bg-primary text-primary-foreground"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
