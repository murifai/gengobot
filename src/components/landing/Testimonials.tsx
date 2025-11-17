'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Lorem Ipsum',
    role: 'Dolor Sit',
    company: 'Amet Inc.',
    content:
      'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
    avatar: '',
  },
  {
    name: 'Sed Do',
    role: 'Eiusmod Tempor',
    company: 'Incididunt Co.',
    content:
      'Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.',
    avatar: '',
  },
  {
    name: 'Consectetur Elit',
    role: 'Magna Aliqua',
    company: 'Veniam Ltd.',
    content:
      'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    avatar: '',
  },
  {
    name: 'Tempor Ut',
    role: 'Labore Dolore',
    company: 'Enim Corp.',
    content:
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem.',
    avatar: '',
  },
  {
    name: 'Aliquip Ex',
    role: 'Commodo Consequat',
    company: 'Nostrud Inc.',
    content:
      'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.',
    avatar: '',
  },
  {
    name: 'Culpa Qui',
    role: 'Officia Deserunt',
    company: 'Mollit LLC',
    content:
      'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam.',
    avatar: '',
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <section className="container mx-auto px-6 py-20 bg-muted/30">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
          Lorem Ipsum Dolor Sit
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="border-border">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="hidden md:block flex-shrink-0">
                <div className="w-64 h-64 rounded-xl bg-gradient-to-br from-primary/20 to-chart-2/20 relative">
                  <Quote className="absolute top-4 left-4 h-8 w-8 text-primary/40" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-lg mb-6 text-foreground leading-relaxed">
                  &ldquo;{testimonials[currentIndex].content}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={testimonials[currentIndex].avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {testimonials[currentIndex].name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">
                      {testimonials[currentIndex].name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonials[currentIndex].role} • {testimonials[currentIndex].company}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation dots */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-primary w-8' : 'bg-border hover:bg-primary/50'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
