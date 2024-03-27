import app from 'flarum/forum/app';
import { extend, override } from 'flarum/extend';
import type * as Mithril from 'mithril';
import ItemList from 'flarum/common/utils/ItemList';

import DiscussionPage from 'flarum/forum/components/DiscussionPage';
import DiscussionListItem from 'flarum/forum/components/DiscussionListItem';

import PostPagination from './components/PostPagination';

app.initializers.add('gtdxyz-discussion-paginator', () => {


  // change Hero position
  // extend(DiscussionPage.prototype, 'view', function (this: DiscussionPage, originalFunc: () => Mithril.Children): Mithril.Children {
  //   if(document.getElementsByClassName('DiscussionPage-discussion').length > 0)
  //   {
  //     if($(document.getElementsByClassName('DiscussionPage-discussion')[0].firstElementChild)?.attr('class').indexOf('Hero') !== -1 ){
  //       // $(document.getElementsByClassName('DiscussionPage-discussion')[0].firstElementChild)?.remove();
  //       m.mount(document.getElementsByClassName('DiscussionPage-discussion')[0].firstElementChild,{view:()=>{return ''}});
  //     }
  //   }

  //   if(document.getElementsByClassName('PostStream').length>0){
  //     if(document.getElementsByClassName('DiscussionPage-thread').length < 1){
  //       m.mount($('<div class="DiscussionPage-thread"/>').insertBefore('.PostStream')[0], {
  //         view: () => (
  //           this.hero()
  //         ),
  //       });
  //     }
  //   }
  // });

  override(DiscussionListItem.prototype, 'getJumpTo', function () {
    return 0;
  });
  
  extend(DiscussionPage.prototype, 'sidebarItems', function (items) {
    items.remove('scrubber');
  });
  
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
  
});