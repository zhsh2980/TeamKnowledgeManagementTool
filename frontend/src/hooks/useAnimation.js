import { useEffect, useRef } from 'react';

// 自定义动画钩子
export const useAnimation = (animationClass = 'animate-fadeInUp', options = {}) => {
  const elementRef = useRef(null);
  const { delay = 0, threshold = 0.1, once = true } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // 使用 Intersection Observer 实现滚动触发动画
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add(animationClass);
            }, delay);

            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            entry.target.classList.remove(animationClass);
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [animationClass, delay, threshold, once]);

  return elementRef;
};

// 页面过渡动画钩子
export const usePageTransition = (duration = 300) => {
  useEffect(() => {
    document.body.style.opacity = '0';
    document.body.style.transform = 'translateY(20px)';

    const timer = setTimeout(() => {
      document.body.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;
      document.body.style.opacity = '1';
      document.body.style.transform = 'translateY(0)';
    }, 10);

    return () => {
      clearTimeout(timer);
      document.body.style.opacity = '';
      document.body.style.transform = '';
      document.body.style.transition = '';
    };
  }, [duration]);
};

// 数字动画钩子
export const useCountUp = (end, duration = 2000) => {
  const countRef = useRef(null);
  const startTimeRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const element = countRef.current;
    if (!element) return;

    const start = 0;
    const range = end - start;

    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      const current = Math.floor(progress * range + start);

      if (element) {
        element.textContent = current.toLocaleString();
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    // 开始动画
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [end, duration]);

  return countRef;
};

// 悬浮效果钩子
export const useHoverEffect = (scaleValue = 1.05) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseEnter = () => {
      element.style.transform = `scale(${scaleValue})`;
      element.style.transition = 'transform 0.3s ease';
    };

    const handleMouseLeave = () => {
      element.style.transform = 'scale(1)';
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [scaleValue]);

  return elementRef;
};

// 打字机效果钩子
export const useTypewriter = (text, speed = 50) => {
  const elementRef = useRef(null);
  const textRef = useRef('');
  const indexRef = useRef(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !text) return;

    const typeChar = () => {
      if (indexRef.current < text.length) {
        textRef.current += text[indexRef.current];
        element.textContent = textRef.current;
        indexRef.current++;
        timeoutRef.current = setTimeout(typeChar, speed);
      }
    };

    // 重置
    textRef.current = '';
    indexRef.current = 0;
    element.textContent = '';

    // 开始打字
    typeChar();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed]);

  return elementRef;
};

export default {
  useAnimation,
  usePageTransition,
  useCountUp,
  useHoverEffect,
  useTypewriter
};