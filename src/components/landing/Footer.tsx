import Link from 'next/link';
import { Github, Twitter, Linkedin, Facebook } from 'lucide-react';

const footerLinks = {
  product: [
    { name: 'Lorem Ipsum', href: '#' },
    { name: 'Dolor Sit', href: '#' },
    { name: 'Amet Consectetur', href: '#' },
    { name: 'Adipiscing Elit', href: '#' },
    { name: 'Sed Do', href: '#' },
    { name: 'Eiusmod Tempor', href: '#' },
  ],
  company: [
    { name: 'Incididunt Ut', href: '#' },
    { name: 'Labore Dolore', href: '#' },
    { name: 'Magna Aliqua', href: '#' },
    { name: 'Ut Enim', href: '#' },
    { name: 'Minim Veniam', href: '#' },
    { name: 'Quis Nostrud', href: '#' },
  ],
  resources: [
    { name: 'Exercitation', href: '#' },
    { name: 'Ullamco Laboris', href: '#' },
    { name: 'Nisi Ut', href: '#' },
    { name: 'Aliquip Ex', href: '#' },
    { name: 'Commodo Consequat', href: '#' },
    { name: 'Duis Aute', href: '#' },
  ],
  social: [
    { name: 'Irure Dolor', href: '#' },
    { name: 'Reprehenderit', href: '#' },
    { name: 'Voluptate Velit', href: '#' },
    { name: 'Esse Cillum', href: '#' },
    { name: 'Dolore Fugiat', href: '#' },
    { name: 'Pariatur', href: '#' },
  ],
  legal: [
    { name: 'Excepteur Sint', href: '#' },
    { name: 'Occaecat', href: '#' },
    { name: 'Cupidatat', href: '#' },
    { name: 'Non Proident', href: '#' },
    { name: 'Sunt Culpa', href: '#' },
    { name: 'Officia Deserunt', href: '#' },
  ],
};

const socialIcons = [
  { Icon: Twitter, href: '#', label: 'Twitter' },
  { Icon: Linkedin, href: '#', label: 'LinkedIn' },
  { Icon: Facebook, href: '#', label: 'Facebook' },
  { Icon: Github, href: '#', label: 'GitHub' },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-8 gap-x-8 gap-y-10">
          {/* Logo & Description */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary" />
              <span className="text-xl font-bold text-foreground">GengoBot</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </p>
            <div className="flex gap-4 mt-6">
              {socialIcons.map(({ Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Lorem</h3>
            <ul className="space-y-3">
              {footerLinks.product.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Ipsum</h3>
            <ul className="space-y-3">
              {footerLinks.company.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Dolor</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Sit</h3>
            <ul className="space-y-3">
              {footerLinks.social.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Amet</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} GengoBot. Lorem ipsum dolor sit amet consectetur.
          </p>
        </div>
      </div>
    </footer>
  );
}
