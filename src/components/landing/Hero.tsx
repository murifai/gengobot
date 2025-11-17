import { Button } from '@/components/ui/Button';
import { ArrowRight, Play } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function Hero() {
  return (
    <section className="container mx-auto px-6 pt-32 pb-20">
      <div className="flex flex-col lg:flex-row items-center gap-12">
        {/* Content */}
        <div className="flex-1 text-center lg:text-left">
          <Badge variant="secondary" className="mb-6 border border-primary/20 bg-primary/5">
            Lorem Ipsum v1.0.0
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
            Lorem ipsum dolor sit amet{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-chart-2">
              consectetur adipiscing
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button size="lg" className="bg-primary hover:opacity-90">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
        </div>
        {/* Image placeholder */}
        <div className="flex-1 w-full max-w-lg">
          <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/10 to-chart-2/10 border-2 border-border flex items-center justify-center">
            <p className="text-muted-foreground">Hero Image</p>
          </div>
        </div>
      </div>
    </section>
  );
}
