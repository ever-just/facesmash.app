import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "@/integrations/api/client";
import { Star } from "lucide-react";
interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}
interface FeedbackForm {
  feedbackType: string;
  subject: string;
  description: string;
  rating: number;
}
const FeedbackModal = ({
  isOpen,
  onClose,
  userEmail
}: FeedbackModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const form = useForm<FeedbackForm>({
    defaultValues: {
      feedbackType: "",
      subject: "",
      description: "",
      rating: 0
    }
  });
  const onSubmit = async (data: FeedbackForm) => {
    setIsSubmitting(true);
    try {
      await api.submitFeedback({
        category: data.feedbackType === 'bug_report' ? 'bug' : data.feedbackType === 'feature_request' ? 'feature' : 'general',
        message: `[${data.subject}] ${data.description}`,
        rating: selectedRating,
      });
      toast.success("Thank you for your feedback!");
      form.reset();
      setSelectedRating(0);
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const StarRating = () => <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map(star => <button key={star} type="button" onClick={() => setSelectedRating(star)} className="focus:outline-none">
          <Star className={`h-6 w-6 ${star <= selectedRating ? "text-yellow-400 fill-current" : "text-gray-400"} hover:text-yellow-400 transition-colors`} />
        </button>)}
    </div>;
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Send Feedback
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Help us improve FaceSmash by sharing your thoughts and suggestions.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="feedbackType" render={({
            field
          }) => <FormItem>
                  <FormLabel className="text-white">Feedback Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Select feedback type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="bug_report" className="text-white">Bug Report</SelectItem>
                      <SelectItem value="feature_request" className="text-white">Feature Request</SelectItem>
                      <SelectItem value="general" className="text-white">General Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="subject" render={({
            field
          }) => <FormItem>
                  <FormLabel className="text-white">Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description of your feedback" className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="description" render={({
            field
          }) => <FormItem>
                  <FormLabel className="text-white">Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Please provide detailed feedback..." className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <div>
              <FormLabel className="text-white">Rating (Optional)</FormLabel>
              <div className="mt-2">
                <StarRating />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="border-gray-600 bg-gray-900 hover:bg-gray-800 text-slate-100">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-white text-black hover:bg-gray-200">
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>;
};
export default FeedbackModal;
