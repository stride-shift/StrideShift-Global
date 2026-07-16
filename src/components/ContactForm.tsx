import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, Mail, User, MessageSquare, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { site } from '@/data/stride';
import { getSupabase } from '@/lib/supabase';
import { captureFirstTouch, getFirstTouch } from '@/lib/firstTouch';

// Common disposable / throwaway email domains. Not exhaustive — just the ones
// that show up most often in low-effort spam.
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  'guerrillamail.info',
  '10minutemail.com',
  'trashmail.com',
  'throwaway.email',
  'yopmail.com',
  'getnada.com',
  'sharklasers.com',
  'maildrop.cc',
  'dispostable.com',
  'fakeinbox.com',
]);

// Names shouldn't contain URLs, scripting, or look like CMS spam.
// Allows letters from any language, spaces, hyphens, apostrophes, periods.
const NAME_BLOCK = /(https?:\/\/|www\.|<|>|\{|\}|\[|\])/i;

const formSchema = z.object({
  first: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(80, 'First name is too long')
    .refine((v) => !NAME_BLOCK.test(v), 'Name looks invalid'),
  last: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(80, 'Last name is too long')
    .refine((v) => !NAME_BLOCK.test(v), 'Name looks invalid'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email is required')
    .max(254, 'Email is too long')
    .email('Please enter a valid email')
    .refine(
      (v) => /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(v) && !v.includes('..'),
      'Please enter a valid email'
    )
    .refine(
      (v) => !DISPOSABLE_DOMAINS.has(v.split('@')[1] ?? ''),
      'Please use a non-disposable email'
    ),
  company: z
    .string()
    .trim()
    .max(120, 'Company name is too long')
    .optional()
    .or(z.literal('')),
  message: z
    .string()
    .trim()
    .min(10, 'Tell us a bit more (at least 10 characters)')
    .max(2000, "That's a lot — keep it under 2000 characters"),
  honeypot: z.string().max(0, 'Bot detected'),
  timestamp: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

// Anti-spam cooldown — block resubmits within 30s from the same browser.
const COOLDOWN_KEY = 'stride-contact-cooldown';
const COOLDOWN_MS = 30_000;

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStartTime] = useState<number>(Date.now());
  const { toast } = useToast();

  // Remember where this visitor came from (LinkedIn, Google, …) so the
  // enquiry carries its origin into the admin Messages panel.
  useEffect(() => {
    captureFirstTouch();
  }, []);

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

      // Time-on-form check — humans typically take a few seconds.
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

      // Per-browser cooldown — block rapid resubmits from the same person.
      try {
        const lastRaw = window.localStorage.getItem(COOLDOWN_KEY);
        const last = lastRaw ? parseInt(lastRaw, 10) : 0;
        const since = Date.now() - last;
        if (since < COOLDOWN_MS) {
          const secs = Math.ceil((COOLDOWN_MS - since) / 1000);
          toast({
            title: 'Please wait a moment',
            description: `You just sent a message — try again in ${secs}s.`,
            variant: 'destructive',
          });
          setIsSubmitting(false);
          return;
        }
      } catch {
        /* localStorage unavailable — ignore */
      }

      // Persist to Supabase contact_messages table (admin reads this in the
      // Messages tab). Falls back gracefully if Supabase isn't configured.
      const supa = getSupabase();
      if (supa) {
        const { error } = await supa.from('contact_messages').insert({
          first_name: data.first,
          last_name: data.last,
          email: data.email,
          company: data.company || null,
          message: data.message,
          source: 'contact_page',
          referrer: getFirstTouch(),
        });
        if (error) throw new Error(error.message);
      } else {
        // No Supabase — keep the UX consistent by simulating a short delay.
        await new Promise((res) => setTimeout(res, 700));
      }

      // Stamp the cooldown only after a successful submit.
      try {
        window.localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
      } catch {
        /* ignore */
      }

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
            render={({ field }) => {
              const len = field.value?.length ?? 0;
              return (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-stride-text-strong">
                      What's on your mind?
                    </FormLabel>
                    <span
                      className={`text-[11px] font-mono tabular-nums ${
                        len > 1900
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-stride-text-muted'
                      }`}
                    >
                      {len} / 2000
                    </span>
                  </div>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-stride-text-muted" />
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about the challenge you're facing…"
                        className="min-h-[140px] pl-9 resize-none"
                        maxLength={2000}
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              );
            }}
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
