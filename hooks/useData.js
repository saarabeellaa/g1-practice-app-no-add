import React from 'react';
import { supabase, TEST_USER_ID } from '../supabase.js';

export function useTopics() {
  const [topics, setTopics] = React.useState([]);
  const [loadingTopics, setLoadingTopics] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      if (!supabase) {
        console.error("Supabase not initialized");
        if (mounted) {
          setTopics([]);
          setLoadingTopics(false);
        }
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('study_topics')
          .select('id, title, "order"')
          .order('"order"', { ascending: true });

        if (error) {
          console.warn('Error loading topics', error);
          if (mounted) setTopics([]);
        } else {
          if (mounted) setTopics(data.map((t) => ({ id: t.id, title: t.title, order: t.order })));
        }
      } catch (err) {
        console.error('Exception loading topics:', err);
        if (mounted) setTopics([]);
      }
      if (mounted) setLoadingTopics(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  return [topics, loadingTopics];
}

export function useTopicQuiz(topicId) {
  const [quiz, setQuiz] = React.useState([]);
  const [loadingQuiz, setLoadingQuiz] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      if (!topicId) {
        setQuiz([]);
        setLoadingQuiz(false);
        return;
      }
      
      if (!supabase) {
        console.error("Supabase not initialized");
        if (mounted) {
          setQuiz([]);
          setLoadingQuiz(false);
        }
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('lesson_quizzes')
          .select('id, question_text, quiz_options(id, option_text, is_correct)')
          .eq('topic_id', topicId)
          .order('id', { ascending: true });

        if (error) {
          console.warn('Error loading topic quiz', error);
          if (mounted) setQuiz([]);
        } else {
          if (mounted) {
            const mapped = (data || []).map((q) => {
              const opts = (q.quiz_options || []).map((o) => o.option_text);
              const correctIndex = (q.quiz_options || []).findIndex((o) => o.is_correct);
              return { question: q.question_text, options: opts, correct: correctIndex >= 0 ? correctIndex : 0 };
            });
            setQuiz(mapped);
          }
        }
      } catch (err) {
        console.error('Exception loading topic quiz:', err);
        if (mounted) setQuiz([]);
      }
      if (mounted) setLoadingQuiz(false);
    }
    load();
    return () => { mounted = false; };
  }, [topicId]);

  return [quiz, loadingQuiz];
}

export function useCategories() {
  const [categories, setCategories] = React.useState([]);
  const [loadingCategories, setLoadingCategories] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      if (!supabase) {
        console.error("Supabase not initialized");
        if (mounted) {
          setCategories([]);
          setLoadingCategories(false);
        }
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('sign_categories')
          .select('id, key, title, icon, signs(id, title, description, image_url)')
          .order('id', { ascending: true });

        if (error) {
          console.warn('Error loading categories', error);
          if (mounted) setCategories([]);
        } else {
          if (mounted) {
            setCategories(
              (data || []).map((c) => ({
                id: c.id,
                key: c.key || String(c.id),
                title: c.title,
                icon: c.icon,
                cards: (c.signs || []).map((s) => ({
                  id: s.id,
                  img: s.image_url,
                  title: s.title,
                  desc: s.description,
                })),
              }))
            );
          }
        }
      } catch (err) {
        console.error('Exception loading categories:', err);
        if (mounted) setCategories([]);
      }
      if (mounted) setLoadingCategories(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  return [categories, loadingCategories];
}

export function useLessons(topicId) {
  const [lessons, setLessons] = React.useState([]);
  const [loadingLessons, setLoadingLessons] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      if (!topicId) {
        setLessons([]);
        setLoadingLessons(false);
        return;
      }
      
      if (!supabase) {
        console.error("Supabase not initialized");
        if (mounted) {
          setLessons([]);
          setLoadingLessons(false);
        }
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('study_lessons')
          .select('id, title, "order"')
          .eq('topic_id', topicId)
          .order('"order"', { ascending: true });

        if (error) {
          console.warn('Error loading lessons', error);
          if (mounted) setLessons([]);
        } else {
          if (mounted) setLessons((data || []).map((l) => ({ id: l.id, title: l.title, order: l.order })));
        }
      } catch (err) {
        console.error('Exception loading lessons:', err);
        if (mounted) setLessons([]);
      }
      if (mounted) setLoadingLessons(false);
    }
    load();
    return () => { mounted = false; };
  }, [topicId]);

  return [lessons, loadingLessons];
}

export function useLesson(lessonId) {
  const [lesson, setLesson] = React.useState(null);
  const [loadingLesson, setLoadingLesson] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      if (!lessonId) {
        setLesson(null);
        setLoadingLesson(false);
        return;
      }
      
      if (!supabase) {
        console.error("Supabase not initialized");
        if (mounted) {
          setLesson(null);
          setLoadingLesson(false);
        }
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('study_lessons')
          .select('id, topic_id, title, content, "order"')
          .eq('id', lessonId)
          .single();

        if (error) {
          console.warn('Error loading lesson', error);
          if (mounted) setLesson(null);
        } else {
          if (mounted) setLesson(data);
        }
      } catch (err) {
        console.error('Exception loading lesson:', err);
        if (mounted) setLesson(null);
      }
      if (mounted) setLoadingLesson(false);
    }
    load();
    return () => { mounted = false; };
  }, [lessonId]);

  return [lesson, loadingLesson];
}

export function useLessonSigns(lessonId) {
  const [signs, setSigns] = React.useState([]);
  const [loadingSigns, setLoadingSigns] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      if (!lessonId) {
        setSigns([]);
        setLoadingSigns(false);
        return;
      }
      
      if (!supabase) {
        console.error("Supabase not initialized");
        if (mounted) {
          setSigns([]);
          setLoadingSigns(false);
        }
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('signs')
          .select('id, title, description, image_url')
          .eq('lesson_id', lessonId)
          .order('id', { ascending: true });

        if (error) {
          console.warn('Error loading lesson signs', error);
          if (mounted) setSigns([]);
        } else {
          if (mounted) {
            const mapped = (data || []).map(sign => ({
              id: sign.id,
              title: sign.title,
              description: sign.description,
              imageUrl: sign.image_url
            }));
            setSigns(mapped);
          }
        }
      } catch (err) {
        console.error('Exception loading lesson signs:', err);
        if (mounted) setSigns([]);
      }
      if (mounted) setLoadingSigns(false);
    }
    load();
    return () => { mounted = false; };
  }, [lessonId]);

  return [signs, loadingSigns];
}

export function useLessonQuiz(lessonId) {
  const [quiz, setQuiz] = React.useState([]);
  const [loadingQuiz, setLoadingQuiz] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      if (!lessonId) {
        setQuiz([]);
        setLoadingQuiz(false);
        return;
      }
      
      if (!supabase) {
        console.error("Supabase not initialized");
        if (mounted) {
          setQuiz([]);
          setLoadingQuiz(false);
        }
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('lesson_quizzes')
          .select('id, question_text, quiz_options(id, option_text, is_correct)')
          .eq('lesson_id', lessonId)
          .order('id', { ascending: true });

        if (error) {
          console.warn('Error loading lesson quiz', error);
          if (mounted) setQuiz([]);
        } else {
          if (mounted) {
            const mapped = (data || []).map((q) => {
              const opts = (q.quiz_options || []).map((o) => o.option_text);
              const correctIndex = (q.quiz_options || []).findIndex((o) => o.is_correct);
              return { question: q.question_text, options: opts, correct: correctIndex >= 0 ? correctIndex : 0 };
            });
            setQuiz(mapped);
          }
        }
      } catch (err) {
        console.error('Exception loading quiz:', err);
        if (mounted) setQuiz([]);
      }
      if (mounted) setLoadingQuiz(false);
    }
    load();
    return () => { mounted = false; };
  }, [lessonId]);

  return [quiz, loadingQuiz];
}

export function useMockTests() {
  const [tests, setTests] = React.useState([]);
  const [loadingTests, setLoadingTests] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      if (!supabase) {
        console.error("Supabase not initialized");
        if (mounted) {
          setTests([]);
          setLoadingTests(false);
        }
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('mock_tests')
          .select('id, title, description, mock_test_questions(id, question_text, mock_test_options(id, option_text, is_correct))')
          .order('id', { ascending: true });

        if (error) {
          console.warn('Error loading mock tests', error);
          if (mounted) setTests([]);
        } else {
          if (mounted) {
            const mapped = (data || []).map((t) => ({
              id: t.id,
              title: t.title,
              description: t.description,
              questions: (t.mock_test_questions || []).map((q) => {
                const opts = (q.mock_test_options || []).map((o) => o.option_text);
                const correct = (q.mock_test_options || []).findIndex((o) => o.is_correct);
                return { id: q.id, question: q.question_text, options: opts, correct: correct >= 0 ? correct : 0 };
              }),
            }));
            setTests(mapped);
          }
        }
      } catch (err) {
        console.error('Exception loading mock tests:', err);
        if (mounted) setTests([]);
      }
      if (mounted) setLoadingTests(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  return [tests, loadingTests];
}