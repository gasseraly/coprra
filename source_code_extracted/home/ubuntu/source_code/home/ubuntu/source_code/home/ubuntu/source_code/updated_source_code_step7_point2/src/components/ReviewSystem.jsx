import { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageCircle, User, Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ReviewSystem = ({ productId, language, darkMode }) => {
  const [reviews, setReviews] = useState([]);
  const [qaItems, setQaItems] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('reviews');
  const [sortBy, setSortBy] = useState('newest');
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: '',
    review_text: ''
  });
  
  // Question form state
  const [questionForm, setQuestionForm] = useState({
    question: ''
  });
  
  // Answer form state
  const [answerForm, setAnswerForm] = useState({
    question_id: null,
    answer: ''
  });

  const isRTL = language === 'ar';

  const texts = {
    ar: {
      reviews: 'المراجعات',
      questions: 'الأسئلة والأجوبة',
      writeReview: 'اكتب مراجعة',
      askQuestion: 'اطرح سؤال',
      rating: 'التقييم',
      reviewTitle: 'عنوان المراجعة',
      reviewText: 'نص المراجعة',
      submitReview: 'إرسال المراجعة',
      question: 'السؤال',
      submitQuestion: 'إرسال السؤال',
      answer: 'الإجابة',
      submitAnswer: 'إرسال الإجابة',
      helpful: 'مفيد',
      verified: 'مشتري موثق',
      sortBy: 'ترتيب حسب',
      newest: 'الأحدث',
      oldest: 'الأقدم',
      highest: 'الأعلى تقييماً',
      lowest: 'الأقل تقييماً',
      mostHelpful: 'الأكثر فائدة',
      noReviews: 'لا توجد مراجعات بعد',
      noQuestions: 'لا توجد أسئلة بعد',
      loginRequired: 'يجب تسجيل الدخول أولاً',
      reviewAdded: 'تم إضافة المراجعة بنجاح',
      questionAdded: 'تم إضافة السؤال بنجاح',
      answerAdded: 'تم إضافة الإجابة بنجاح',
      voteRecorded: 'تم تسجيل التصويت',
      error: 'حدث خطأ، يرجى المحاولة مرة أخرى',
      averageRating: 'متوسط التقييم',
      totalReviews: 'إجمالي المراجعات',
      ratingBreakdown: 'توزيع التقييمات',
      stars: 'نجوم',
      answered: 'تم الإجابة',
      unanswered: 'لم يتم الإجابة',
      answerThis: 'أجب على هذا السؤال'
    },
    en: {
      reviews: 'Reviews',
      questions: 'Questions & Answers',
      writeReview: 'Write a Review',
      askQuestion: 'Ask a Question',
      rating: 'Rating',
      reviewTitle: 'Review Title',
      reviewText: 'Review Text',
      submitReview: 'Submit Review',
      question: 'Question',
      submitQuestion: 'Submit Question',
      answer: 'Answer',
      submitAnswer: 'Submit Answer',
      helpful: 'Helpful',
      verified: 'Verified Purchase',
      sortBy: 'Sort by',
      newest: 'Newest',
      oldest: 'Oldest',
      highest: 'Highest Rated',
      lowest: 'Lowest Rated',
      mostHelpful: 'Most Helpful',
      noReviews: 'No reviews yet',
      noQuestions: 'No questions yet',
      loginRequired: 'Please login first',
      reviewAdded: 'Review added successfully',
      questionAdded: 'Question added successfully',
      answerAdded: 'Answer added successfully',
      voteRecorded: 'Vote recorded',
      error: 'An error occurred, please try again',
      averageRating: 'Average Rating',
      totalReviews: 'Total Reviews',
      ratingBreakdown: 'Rating Breakdown',
      stars: 'stars',
      answered: 'Answered',
      unanswered: 'Unanswered',
      answerThis: 'Answer this question'
    }
  };

  const t = texts[language] || texts.en;

  // Check if user is logged in
  const isLoggedIn = () => {
    return localStorage.getItem('session_token') !== null;
  };

  // Load reviews and Q&A
  useEffect(() => {
    loadReviews();
    loadQA();
  }, [productId, sortBy]);

  const loadReviews = async () => {
    try {
      const response = await fetch(`/api/reviews.php?action=product-reviews&product_id=${productId}&sort=${sortBy}`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews);
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadQA = async () => {
    try {
      const response = await fetch(`/api/reviews.php?action=product-qa&product_id=${productId}&sort=${sortBy}`);
      const data = await response.json();
      
      if (data.success) {
        setQaItems(data.qa_items);
      }
    } catch (error) {
      console.error('Error loading Q&A:', error);
    }
  };

  // Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn()) {
      setMessage({ type: 'error', text: t.loginRequired });
      return;
    }

    if (reviewForm.rating === 0) {
      setMessage({ type: 'error', text: 'Please select a rating' });
      return;
    }

    if (!reviewForm.title.trim() || !reviewForm.review_text.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/reviews.php?action=add-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session_token')}`
        },
        body: JSON.stringify({
          product_id: productId,
          rating: reviewForm.rating,
          title: reviewForm.title,
          review_text: reviewForm.review_text
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: t.reviewAdded });
        setReviewForm({ rating: 0, title: '', review_text: '' });
        loadReviews(); // Reload reviews
      } else {
        setMessage({ type: 'error', text: data.error || t.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t.error });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit question
  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn()) {
      setMessage({ type: 'error', text: t.loginRequired });
      return;
    }

    if (!questionForm.question.trim()) {
      setMessage({ type: 'error', text: 'Please enter a question' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/reviews.php?action=ask-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session_token')}`
        },
        body: JSON.stringify({
          product_id: productId,
          question: questionForm.question
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: t.questionAdded });
        setQuestionForm({ question: '' });
        loadQA(); // Reload Q&A
      } else {
        setMessage({ type: 'error', text: data.error || t.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t.error });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit answer
  const handleSubmitAnswer = async (questionId) => {
    if (!isLoggedIn()) {
      setMessage({ type: 'error', text: t.loginRequired });
      return;
    }

    if (!answerForm.answer.trim()) {
      setMessage({ type: 'error', text: 'Please enter an answer' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/reviews.php?action=answer-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session_token')}`
        },
        body: JSON.stringify({
          question_id: questionId,
          answer: answerForm.answer
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: t.answerAdded });
        setAnswerForm({ question_id: null, answer: '' });
        loadQA(); // Reload Q&A
      } else {
        setMessage({ type: 'error', text: data.error || t.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t.error });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Vote helpful
  const handleHelpfulVote = async (reviewId, type = 'review') => {
    if (!isLoggedIn()) {
      setMessage({ type: 'error', text: t.loginRequired });
      return;
    }

    try {
      const action = type === 'review' ? 'helpful-vote' : 'qa-helpful-vote';
      const body = type === 'review' ? { review_id: reviewId } : { question_id: reviewId };

      const response = await fetch(`/api/reviews.php?action=${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session_token')}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: t.voteRecorded });
        if (type === 'review') {
          loadReviews();
        } else {
          loadQA();
        }
      } else {
        setMessage({ type: 'error', text: data.error || t.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t.error });
    }
  };

  // Render star rating
  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => onRatingChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  // Render rating breakdown
  const renderRatingBreakdown = () => {
    if (!statistics) return null;

    const total = statistics.total_reviews;
    if (total === 0) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = statistics.rating_breakdown[rating] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center space-x-2">
              <span className="text-sm font-medium w-8">{rating}</span>
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <Progress value={percentage} className="flex-1 h-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message.text && (
        <Alert className={message.type === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-green-500 bg-green-50 dark:bg-green-900/20'}>
          {message.type === 'error' ? (
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          )}
          <AlertDescription className={message.type === 'error' ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Overview */}
      {statistics && statistics.total_reviews > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t.averageRating}</span>
              <Badge variant="secondary">
                {statistics.total_reviews} {t.totalReviews}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                  {statistics.average_rating}
                </div>
                {renderStars(Math.round(statistics.average_rating))}
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {statistics.total_reviews} {t.totalReviews}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-3">{t.ratingBreakdown}</h4>
                {renderRatingBreakdown()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Reviews and Q&A */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="reviews" className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>{t.reviews}</span>
            </TabsTrigger>
            <TabsTrigger value="qa" className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>{t.questions}</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <Label htmlFor="sort-select" className="text-sm">
              {t.sortBy}:
            </Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t.newest}</SelectItem>
                <SelectItem value="oldest">{t.oldest}</SelectItem>
                <SelectItem value="highest">{t.highest}</SelectItem>
                <SelectItem value="lowest">{t.lowest}</SelectItem>
                <SelectItem value="helpful">{t.mostHelpful}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          {/* Write Review Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Star className="h-4 w-4 mr-2" />
                {t.writeReview}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t.writeReview}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <Label>{t.rating}</Label>
                  <div className="mt-2">
                    {renderStars(reviewForm.rating, true, (rating) => 
                      setReviewForm({ ...reviewForm, rating })
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="review-title">{t.reviewTitle}</Label>
                  <Input
                    id="review-title"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                    placeholder={t.reviewTitle}
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <Label htmlFor="review-text">{t.reviewText}</Label>
                  <Textarea
                    id="review-text"
                    value={reviewForm.review_text}
                    onChange={(e) => setReviewForm({ ...reviewForm, review_text: e.target.value })}
                    placeholder={t.reviewText}
                    rows={4}
                    disabled={isSubmitting}
                  />
                </div>
                
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t.submitReview}
                    </>
                  ) : (
                    t.submitReview
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">{t.noReviews}</p>
                </CardContent>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarImage src={review.user.avatar_url} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{review.user.name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              {renderStars(review.rating)}
                              {review.is_verified_purchase && (
                                <Badge variant="secondary" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {t.verified}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(review.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium mb-2">{review.title}</h5>
                          <p className="text-gray-700 dark:text-gray-300">{review.review_text}</p>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleHelpfulVote(review.id, 'review')}
                            className="text-gray-600 dark:text-gray-400"
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {t.helpful} ({review.helpful_votes})
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Q&A Tab */}
        <TabsContent value="qa" className="space-y-4">
          {/* Ask Question Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <MessageCircle className="h-4 w-4 mr-2" />
                {t.askQuestion}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.askQuestion}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitQuestion} className="space-y-4">
                <div>
                  <Label htmlFor="question">{t.question}</Label>
                  <Textarea
                    id="question"
                    value={questionForm.question}
                    onChange={(e) => setQuestionForm({ question: e.target.value })}
                    placeholder={t.question}
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>
                
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t.submitQuestion}
                    </>
                  ) : (
                    t.submitQuestion
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Q&A List */}
          <div className="space-y-4">
            {qaItems.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">{t.noQuestions}</p>
                </CardContent>
              </Card>
            ) : (
              qaItems.map((qa) => (
                <Card key={qa.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Question */}
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage src={qa.questioner.avatar_url} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{qa.questioner.name}</h4>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(qa.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                            </div>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">{qa.question}</p>
                        </div>
                      </div>

                      {/* Answer */}
                      {qa.answer ? (
                        <div className="ml-12 pl-4 border-l-2 border-green-200 dark:border-green-800">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={qa.answerer?.avatar_url} />
                              <AvatarFallback>
                                <User className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <h5 className="font-medium text-sm">{qa.answerer?.name}</h5>
                                  <Badge variant="secondary" className="text-xs">
                                    {t.answered}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(qa.answered_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                </div>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 text-sm">{qa.answer}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="ml-12 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                          <Badge variant="outline" className="text-xs mb-2">
                            {t.unanswered}
                          </Badge>
                          
                          {/* Answer Form */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                {t.answerThis}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{t.answerThis}</DialogTitle>
                              </DialogHeader>
                              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                                <p className="text-sm font-medium mb-1">{t.question}:</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{qa.question}</p>
                              </div>
                              <form onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmitAnswer(qa.id);
                              }} className="space-y-4">
                                <div>
                                  <Label htmlFor="answer">{t.answer}</Label>
                                  <Textarea
                                    id="answer"
                                    value={answerForm.answer}
                                    onChange={(e) => setAnswerForm({ ...answerForm, answer: e.target.value })}
                                    placeholder={t.answer}
                                    rows={3}
                                    disabled={isSubmitting}
                                  />
                                </div>
                                
                                <Button type="submit" disabled={isSubmitting} className="w-full">
                                  {isSubmitting ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      {t.submitAnswer}
                                    </>
                                  ) : (
                                    t.submitAnswer
                                  )}
                                </Button>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}

                      {/* Helpful Vote */}
                      <div className="flex items-center justify-between pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleHelpfulVote(qa.id, 'qa')}
                          className="text-gray-600 dark:text-gray-400"
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {t.helpful} ({qa.helpful_votes})
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReviewSystem;

