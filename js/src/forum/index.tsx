import app from 'flarum/forum/app';
import { extend, override } from 'flarum/extend';
import type * as Mithril from 'mithril';
import ItemList from 'flarum/common/utils/ItemList';

import PostStreamState from 'flarum/forum/states/PostStreamState';
import DiscussionPage from 'flarum/forum/components/DiscussionPage';
import DiscussionListItem from 'flarum/forum/components/DiscussionListItem';
import CommentPost from 'flarum/forum/components/CommentPost';

import PostPagination from './components/PostPagination';

app.initializers.add('gtdxyz-discussion-paginator', () => {

  // remove jumpTo from discussionListeItem
  override(DiscussionListItem.prototype, 'getJumpTo', function () {
    //#TODO change this to page number
    //link to discussion page the latest posts.
    return 0;
  });
  
  // remove scrubber
  extend(DiscussionPage.prototype, 'sidebarItems', function (items) {
    items.remove('scrubber');
  });

  // override near number to page
  override(DiscussionPage.prototype, 'show', function(original, discussion): void {

    //--------> this part is same as original start.

    app.history.push('discussion', discussion.title());
    app.setTitle(discussion.title());
    app.setTitleCount(0);

    // When the API responds with a discussion, it will also include a number of
    // posts. Some of these posts are included because they are on the first
    // page of posts we want to display (determined by the `near` parameter) –
    // others may be included because due to other relationships introduced by
    // extensions. We need to distinguish the two so we don't end up displaying
    // the wrong posts. We do so by filtering out the posts that don't have
    // the 'discussion' relationship linked, then sorting and splicing.
    let includedPosts: Post[] = [];
    if (discussion.payload && discussion.payload.included) {
      const discussionId = discussion.id();

      includedPosts = discussion.payload.included
        .filter(
          (record) =>
            record.type === 'posts' &&
            record.relationships &&
            record.relationships.discussion &&
            !Array.isArray(record.relationships.discussion.data) &&
            record.relationships.discussion.data.id === discussionId
        )
        // We can make this assertion because posts should be in the store,
        // since they were in the discussion's payload.
        .map((record) => app.store.getById<Post>('posts', record.id) as Post)
        .sort((a: Post, b: Post) => a.number() - b.number())
        .slice(0, 20);
    }

    // Set up the post stream for this discussion, along with the first page of
    // posts we want to display. Tell the stream to scroll down and highlight
    // the specific post that was routed to.
    this.stream = new PostStreamState(discussion, includedPosts);

    //--------> this part is same as original end.

    // near is page number, calculate the offset.
    // m.route.set('/d/'+m.route.param('id')+'/:near', {near: 5})
    const rawNearParam = m.route.param('near');
    const nearParam = rawNearParam === 'reply' ? 'reply' : parseInt(rawNearParam);

    let goNearParam:number | string;
    if(nearParam === 'reply'){
      goNearParam = nearParam;
    }else {
      goNearParam = (nearParam-1)*20 + 1 + 10;
    }
    
    this.stream.goToNumber(goNearParam || (includedPosts[0]?.number() ?? 0), true).then(() => {
      this.discussion = discussion;

      app.current.set('discussion', discussion);
      app.current.set('stream', this.stream);

    });
    
  });
  
  // override view with paginator
  override(DiscussionPage.prototype, 'view', function (this: DiscussionPage, originalFunc: () => Mithril.Children): Mithril.Children {

    this.pageChanged = function(pageNumber: number): void {
      const discussion = this.discussion;
  
      if (!discussion) return;
  
      // Construct a URL to this discussion with the updated position, then
      // replace it into the window's history and our own history stack.
      const url = app.route.discussion(discussion, (this.near = pageNumber));
  
      window.history.replaceState(null, document.title, url);
      app.history.push('discussion', discussion.title());
      
      // ignore the lastReadPostNumber
      // If the user hasn't read past here before, then we'll update their read
      // state and redraw.
      // if (app.session.user && endNumber > (discussion.lastReadPostNumber() || 0)) {
      //   discussion.save({ lastReadPostNumber: endNumber });
      //   m.redraw();
      // }
    }
      
    this.mainContent = function(): ItemList<Mithril.Children> {
      const items = new ItemList<Mithril.Children>();
      items.add('sidebar', this.sidebar(), 100);
      items.add(
        'poststream',
        <div className="DiscussionPage-stream">
          <PostPagination discussion={this.discussion} stream={this.stream} onPageChange={this.pageChanged.bind(this)} />
        </div>,
        10
      );
  
      return items;
    }
    return originalFunc();
  });


  // add number to commentpost
  extend(CommentPost.prototype, 'headerItems', function (items) {
    const post = this.attrs.post;

    if (post.isHidden()) return;

    items.add(
      'postnumber',
      <div className="postNumber">
        <span>#</span>{post.number()}
      </div>,
      0
    );
    
  });
  
});