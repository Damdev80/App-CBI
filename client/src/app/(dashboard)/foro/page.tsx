'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { forumApi } from '@/lib/api';
import type { ForumPost } from '@/types';
import { Plus, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await forumApi.getPosts();
        setPosts(data as ForumPost[]);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Foro</h1>
          <p className="text-muted-foreground">Discusiones y publicaciones</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Publicación
        </Button>
      </motion.div>

      <div className="grid gap-6">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-48 bg-muted rounded" />
                <div className="h-4 w-32 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay publicaciones en el foro</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription>
                    Por {post.authorName || 'Anónimo'} •{' '}
                    {new Date(post.createdAt).toLocaleDateString('es-CO')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{post.content}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
