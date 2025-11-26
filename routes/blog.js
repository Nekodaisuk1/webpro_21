//ルーティング定義
var express = require('express');
var router = express.Router();
// `generated/prisma`が存在しないと起動時にエラーになる(一敗)。
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

//一覧表示用
// トップ（投稿一覧）ページ
//  PrismaのfindManyはでテーブルの全行を取得します
router.get('/', async function(req, res, next) {
  try {
    // 投稿日降順にソート。
    const posts = await prisma.blog.findMany({ orderBy: { postedAt: 'desc' } });
    res.render('blog_index', { posts });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading posts');
  }
});

//投稿用
router.post('/create', async function(req, res, next) {
  try {
    // フォームから送信されたデータを取得
    const { title, content, postedAt } = req.body;
    // Prisma Clientを使って新しい投稿を作成
    await prisma.blog.create({ data: { title, content, postedAt: postedAt ? new Date(postedAt) : undefined } });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating post');
  }
});

//検索用
router.get('/search', async function(req, res, next) {
  try {
    // クエリ文字列からキーワードを取得
    const q = req.query.q || '';
    // タイトルまたは内容にキーワードが含まれる投稿を検索(p.title / p.content)
    const posts = await prisma.blog.findMany({ where: { OR: [ { title: { contains: q } }, { content: { contains: q } } ] }, orderBy: { postedAt: 'desc' } });
    res.render('search', { posts, q });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error searching posts');
  }
});

module.exports = router;
