import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, Mail, User, MessageSquare, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { site } from '@/data/stride';

const formSchema = z.object({
  first: z.string().min(1, 'First name is required'),
  last: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  company: z.string().optional(),
  message: z.string().min(10, 'Tell us a bit more (at least 10 characters)'),
  honeypot: z.string().max(0, 'Bot detected'),
  timestamp: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStartTime] = useState<number>(Date.now());
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first: '',
      last: '',
      email: '',
      company: '',
      message: '',
      honeypot: '',
      timestamp: formStartTime,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      if (data.honeypot) {
        toast({ title: 'Error', description: 'Submission flagged.', variant: 'destructive' });
        return;
      }
      const timeDiff = Date.now() - data.timestamp;
      if (timeDiff < 3000) {
        toast({
          title: 'Whoa, that was quick',
          description: 'Take a moment to review your message before submitting.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Form submission placeholder — wire to your backend / email service of choice.
      await new Promise((res) => setTimeout(res, 700));

      toast({
        title: 'Thanks — we got it.',
        description: "We'll be in touch within one business day.",
      });

      form.reset({
        first: '',
        last: '',
        email: '',
        company: '',
        message: '',
        honeypot: '',
        timestamp: Date.now(),
      });
    } catch {
      toast({
        title: 'Error',
        description: 'There was a problem sending your message. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-stride-bg-elev rounded-2xl shadow-xl p-6 md:p-8 border border-stride-border">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-stride-text-strong">First name</FormLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-stride-text-muted" />
                    <FormControl>
                      <Input placeholder="Jane" className="pl-9" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-stride-text-strong">Last name</FormLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-stride-text-muted" />
                    <FormControl>
                      <Input placeholder="Doe" className="pl-9" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-stride-text-strong">Email</FormLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-stride-text-muted" />
                  <FormControl>
                    <Input type="email" placeholder="jane@company.com" className="pl-9" {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-stride-text-strong">Company</FormLabel>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-stride-text-muted" />
                  <FormControl>
                    <Input placeholder="Where do you work?" className="pl-9" {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-stride-text-strong">What's on your mind?</FormLabel>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-stride-text-muted" />
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about the challenge you're facing…"
                      className="min-h-[140px] pl-9 resize-none"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Honeypot */}
          <FormField
            control={form.control}
            name="honeypot"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormLabel>Leave this empty</FormLabel>
                <FormControl>
                  <Input {...field} tabIndex={-1} autoComplete="off" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="timestamp"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <Input type="hidden" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-stride-navy hover:bg-stride-navy-dark text-white py-3 px-6 rounded-md transition-colors flex items-center justify-center disabled:opacity-70 font-medium"
          >
            {isSubmitting ? (
              'Sending…'
            ) : (
              <>
                Send
                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
          <p className="text-xs text-stride-text-muted text-center">
            We respond within one business day. Or email{' '}
            <a href={`mailto:${site.email}`} className="underline">
              {site.email}
            </a>
            .
          </p>
        </form>
      </Form>
    </div>
  );
};

export default ContactForm;
