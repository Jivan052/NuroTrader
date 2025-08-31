import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Menu, X, Bot } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Analytics Hub", href: "#analytics" },
    { name: "NeuroTrader", href: "#neurotrader" },
    { name: "AI Agent", href: "/agent", isPageLink: true, icon: Bot },
    { name: "Docs", href: "#docs" }
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border"
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">N</span>
            </div>
            <span className="text-xl font-bold gradient-text">NeuroTrader</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList className="flex space-x-6">
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.name}>
                    {item.isPageLink ? (
                      <motion.div
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link
                          to={item.href}
                          className="text-silver hover:text-primary transition-colors duration-200 font-medium flex items-center"
                        >
                          {item.icon && <item.icon className="h-4 w-4 mr-1" />}
                          {item.name}
                        </Link>
                      </motion.div>
                    ) : (
                      <motion.a
                        href={item.href}
                        className="text-silver hover:text-primary transition-colors duration-200 font-medium"
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.name}
                      </motion.a>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* CTA Button & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="hero" 
              size="sm" 
              className="hidden sm:inline-flex"
            >
              Get Started
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-silver hover:text-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: isMenuOpen ? "auto" : 0, 
            opacity: isMenuOpen ? 1 : 0 
          }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden border-t border-border"
        >
          <div className="py-4 space-y-3">
            {navItems.map((item) => (
              item.isPageLink ? (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-4 py-2 text-silver hover:text-primary hover:bg-accent/50 rounded-lg transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <motion.div 
                    className="flex items-center"
                    whileHover={{ x: 8 }}
                  >
                    {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                    {item.name}
                  </motion.div>
                </Link>
              ) : (
                <motion.a
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2 text-silver hover:text-primary hover:bg-accent/50 rounded-lg transition-all duration-200"
                  whileHover={{ x: 8 }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </motion.a>
              )
            ))}
            <div className="px-4 pt-2">
              <Button variant="hero" className="w-full" size="sm">
                Get Started
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;