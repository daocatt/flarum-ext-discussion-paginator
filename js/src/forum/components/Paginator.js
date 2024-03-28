import Component from 'flarum/common/Component';
import ItemList from 'flarum/common/utils/ItemList';
import listItems from 'flarum/common/helpers/listItems';

/**
 * The `Paginator` component displays the pagination.
 *
 * ### attrs
 *
 * - `stream`
 * - `listCount`
 * - `pageCurrent`
 */
export default class Paginator extends Component {

  oninit(vnode) {
    super.oninit(vnode);
    this.stream = this.attrs.stream;

    this.perPage = 20;
    this.perBlock = 5;
    this.listCount = parseInt(this.attrs.listCount);
    
    this.pageCurrent = parseInt(this.attrs.pageCurrent);
    
    
    //every 5 page as a page block
    this.pageCount = Math.ceil(this.listCount/this.perPage);

  }

  oncreate(vnode) {
    super.oncreate(vnode);

    // const items = this.$('.item-pageItem');
    // Object.keys(items).forEach((e) => {
      
    //   items[e].bind('click', this.goToPage.bind(this, 5))
    // });

  }
  onupdate(vnode) {
    super.onupdate(vnode);

  }

  view() {
    if(this.listCount <= 20){
      return '';
    }
    return (
      <div className="Paginator">
        <div className="container">
          <ul className="Paginator-items">
            {listItems(this.items().toArray())}
          </ul>
        </div>
      </div>
    );
  }

  /**
   * Build an item list for the contents of the discussion hero.
   *
   * @return {ItemList<import('mithril').Children>}
   */
  items() {
    const items = new ItemList();
    
    var pageCurrent = this.pageCurrent;

    //every 5 page as a page block
    var pageCount = this.pageCount;

    pageCurrent = pageCurrent > pageCount?pageCount:pageCurrent;

    items.add('firstPage', <span classname={pageCurrent==1 && "current"} onclick={this.goToFirst.bind(this)}>&lt;</span>);

    

    let blockCurrent = Math.floor(pageCurrent/this.perBlock);
    if(pageCurrent === this.perBlock * blockCurrent){
      blockCurrent--;
    }
    

    var i;
    let starter = blockCurrent*this.perBlock + 1;
    let maxEnd = (blockCurrent+1)*this.perBlock > pageCount?pageCount:(blockCurrent+1)*this.perBlock;

    if(pageCount-pageCurrent < 5 || pageCount < 11){
      maxEnd = pageCount;
    }

    if(maxEnd - starter < 4){
      starter = starter - (5 - (maxEnd - starter));
    }
    if(starter <=5 ){
      starter = 1;
    }

    if(pageCurrent > 5 && pageCount > 10){
      items.add('prevPage', <span className="prev" onclick={this.goToPage.bind(this, starter-1)}>...</span>);
    }

    let indxPage = 0;
    for(i = starter;i<=maxEnd;i++) {
      indxPage = i;
      items.add(pageCurrent==i ? "pageItem current pageItem-"+i : "pageItem pageItem-"+i, <span className='item' onclick={this.goToPage.bind(this, indxPage)}>{i}</span>);
    }

    if(pageCount-pageCurrent > 5 && pageCount>10){
      items.add('nextPage', <span className="next" onclick={this.goToPage.bind(this, maxEnd+1)}>...</span>);
    }

    items.add('lastPage', <span className={pageCurrent==pageCount && "current"} onclick={this.goToLast.bind(this)}>&gt;</span>);

    return items;
  }

  syncPromise() {
    const $container = $('html, body').stop(true);
    return Promise.all([$container.promise(), this.stream.loadPromise]).then(() => {
      m.redraw.sync();

      this.stream.paused = false;
      
    });
  }

  goToLast() {
    return this.goToPage(this.pageCount);
  }

  goToFirst() {
    this.pageCurrent = 1;
    this.stream.goToFirst();
    this.syncPromise();
  }

  goToPage(indx) {
    indx = parseInt(indx);
    if(indx === 1) {
      return this.goToFirst();
    }

    this.pageCurrent = indx;

    // the goToIndex will change the index-number, minus count/2 
    // so add count/2 to index-number as the parameter
    // count=20
    // indexNumber-count/2

    var indexNumber = (indx-1)*this.perPage + this.perPage/2;
    // console.log(indexNumber);
    
    this.stream.goToIndex(indexNumber);
    this.syncPromise();

    this.attrs.onPageChange(this.pageCurrent);
  }
}
