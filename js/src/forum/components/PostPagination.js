import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import PostLoading from 'flarum/common/components/LoadingPost';
import ReplyPlaceholder from 'flarum/common/components/ReplyPlaceholder';
import ItemList from 'flarum/common/utils/ItemList';
import Paginator from './Paginator';

/**
 * The `PostStream` component displays an infinitely-scrollable wall of posts in
 * a discussion. Posts that have not loaded will be displayed as placeholders.
 *
 * ### Attrs
 *
 * - `discussion`
 * - `stream`
 * - `targetPost`
 * - `onPositionChange`
 */
export default class PostPagination extends Component {
  oninit(vnode) {
    super.oninit(vnode);

    this.discussion = this.attrs.discussion;
    this.stream = this.attrs.stream;

    this.pageCurrent = Math.round(this.stream.visibleStart/20)+1;

    // this.scrollListener = new ScrollListener(this.onscroll.bind(this));
  }

  view() {
    let lastTime;

    // const viewingEnd = this.stream.viewingEnd();
    const viewingEnd = true;

    const posts = this.stream.posts();
    const postIds = this.discussion.postIds();

    const postFadeIn = (vnode) => {
      $(vnode.dom).addClass('fadeIn');
      // 500 is the duration of the fadeIn CSS animation + 100ms,
      // so the animation has time to complete
      setTimeout(() => $(vnode.dom).removeClass('fadeIn'), 500);
    };

    const items = posts.map((post, i) => {
      let content;
      const attrs = { 'data-index': this.stream.visibleStart + i };
        
      if (post) {
        const time = post.createdAt();
        const PostComponent = app.postComponents[post.contentType()];
        content = !!PostComponent && <PostComponent post={post} />;

        attrs.key = 'post' + post.id();
        attrs.oncreate = postFadeIn;
        attrs['data-time'] = time.toISOString();
        attrs['data-number'] = post.number();
        attrs['data-id'] = post.id();
        attrs['data-type'] = post.contentType();

        // If the post before this one was more than 4 days ago, we will
        // display a 'time gap' indicating how long it has been in between
        // the posts.
        const dt = time - lastTime;

        if (dt > 1000 * 60 * 60 * 24 * 4) {
          content = [
            <div className="PostStream-timeGap">
              <span>{app.translator.trans('core.forum.post_stream.time_lapsed_text', { period: dayjs().add(dt, 'ms').fromNow(true) })}</span>
            </div>,
            content,
          ];
        }

        lastTime = time;
      } else {
        attrs.key = 'post' + postIds[this.stream.visibleStart + i];

        content = <PostLoading />;
      }

      return (
        <div className="PostStream-item" {...attrs}>
          {content}
        </div>
      );
    });


    items.push(
        <div className="PostStream-pagination" key="pagination">
          <Paginator listCount={this.stream.discussion.attribute('commentCount')} stream={this.stream} onPageChange={this.attrs.onPageChange} pageCurrent={this.pageCurrent} ></Paginator>
        </div>
    );

    // Allow extensions to add items to the end of the post stream.
    if (viewingEnd) {
      items.push(...this.endItems().toArray());
    }

    // If we're viewing the end of the discussion, the user can reply, and
    // is not already doing so, then show a 'write a reply' placeholder.
    if (viewingEnd && (!app.session.user || this.discussion.canReply())) {
      items.push(
        <div className="PostStream-item" key="reply" data-index={this.stream.count()} oncreate={postFadeIn}>
          <ReplyPlaceholder discussion={this.discussion} />
        </div>
      );
    }

    return (
      <div className="PostStream" role="feed" aria-live="off" aria-busy={this.stream.pagesLoading ? 'true' : 'false'}>
        {items}
      </div>
    );
  }

  /**
   * @returns {ItemList<import('mithril').Children>}
   */
  endItems() {
    const items = new ItemList();

    return items;
  }

  onupdate(vnode) {
    super.onupdate(vnode);
  }

  oncreate(vnode) {
    super.oncreate(vnode);
  }

}
