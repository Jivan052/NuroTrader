import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Github, Twitter, MessageCircle, ArrowRight, Book } from "lucide-react";

const Footer = () => {
  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Analytics Hub", href: "#analytics" },
        { name: "NeuroTrader", href: "#neurotrader" },
        { name: "Multi-Chain", href: "#chains" },
        { name: "API Access", href: "#api" }
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "#docs" },
        { name: "Tutorials", href: "#tutorials" },
        { name: "Community", href: "#community" },
        { name: "Support", href: "#support" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#about" },
        { name: "Careers", href: "#careers" },
        { name: "Privacy", href: "#privacy" },
        { name: "Terms", href: "#terms" }
      ]
    }
  ];

  return (
    <footer className="relative">
      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-secondary to-accent">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-silver-bright">
              Experience <span className="gradient-text">AI-Driven</span> Web3 Autonomy
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of traders who trust NeuroTrader for intelligent, gasless DeFi execution
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="group">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="silver" size="lg" className="group">
                <Book className="mr-2 h-5 w-5" />
                Read Docs
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Content */}
      <div className="bg-card border-t border-border">
        <div className="container mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-4 gap-12">
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="text-2xl font-bold gradient-text">NeuroTrader</div>
              <p className="text-muted-foreground max-w-sm">
                Autonomous analytics and trading for Web3, powered by AI and real-time data.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Github className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <MessageCircle className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>

            {/* Footer Links */}
            {footerSections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-silver-bright">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <a 
                        href={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <Separator className="my-8 bg-border" />

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <p className="text-muted-foreground text-sm">
              © 2024 NeuroTrader. All rights reserved. Built with ❤️ for the Web3 community.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Powered by 0xgasless AgentKit</span>
              <span>•</span>
              <span>ERC-4337 Compatible</span>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;