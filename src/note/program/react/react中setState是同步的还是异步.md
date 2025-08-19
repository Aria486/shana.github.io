## 

```
react中setState是同步的还是异步？

异步的，setState不能立马拿到结果（真的是这样么？）
```

### `setState`真的是异步的吗？

**为了方便理解和简化流程，我们默认react内部代码执行到`performWork` 、`performWorkOnRoot`、`performSyncWork`、`performAsyncWork`这四个方法的时候，就是react去update更新并且作用到UI上。**

#### 1. 合成事件中的`setState`

react为了解决跨平台，兼容性问题，自己封装了一套事件机制，代理了原生的事件，像在`jsx`中常见的`onClick`、`onChange`这些都是合成事件。

<Code language="js">
import React from 'react';
class Count extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    }
  }
  coundAddAsync = () => {
    this.setState({count: this.state.count + 1});
    console.log(this.state.count);
    this.setState({count: this.state.count + 1});
    console.log(this.state.count);
    this.setState({count: this.state.count + 1});
    console.log(this.state.count);
  }

  render() {
    return (
    <>
      \<button onClick={this.coundAddAsync}>{this.state.count}</button>
    </>
    )
  }
}
export default Count; 

</Code>

合成事件中的`setState`写法比较常见
![image](https://user-images.githubusercontent.com/19586882/103729874-588eec00-501c-11eb-8d32-150aa1c16ad7.png)


从 `dispatchInteractiveEvent` 到 `callCallBack` 为止，都是对合成事件的处理和执行，从 `setState` 到 `requestWork` 是调用 `this.setState` 的逻辑，这边主要看下  `requestWork` 这个函数。

<Code language="js">
function requestWork(root, expirationTime) {
  addRootToSchedule(root, expirationTime);

  if (isRendering) {
    // Prevent reentrancy. Remaining work will be scheduled at the end of
    // the currently rendering batch.
    return;
  }

  if (isBatchingUpdates) {
    // Flush work at the end of the batch.
    if (isUnbatchingUpdates) {
      // ...unless we're inside unbatchedUpdates, in which case we should
      // flush it now.
      nextFlushedRoot = root;
      nextFlushedExpirationTime = Sync;
      performWorkOnRoot(root, Sync, false);
    }
    return;
  }

  // TODO: Get rid of Sync and use current time?
  if (expirationTime === Sync) {
    performSyncWork();
  } else {
    scheduleCallbackWithExpiration(expirationTime);
  }
}
</Code>

在 `requestWork` 中有三个if分支，三个分支中有两个方法 `performWorkOnRoot` 和 `performSyncWork` ，就是我们默认的update函数，但是在合成事件中，走的是第二个if分支，第二个分支中有两个标识 `isBatchingUpdates` 和 `isUnbatchingUpdates` 两个初始值都为  `false` ，但是在 `interactiveUpdates$1` 中会把 `isBatchingUpdates` 设为 `true` ，下面就是 `interactiveUpdates$1` 的代码：

<Code language="js">
function interactiveUpdates$1(fn, a, b) {
  if (isBatchingInteractiveUpdates) {
    return fn(a, b);
  }
  // If there are any pending interactive updates, synchronously flush them.
  // This needs to happen before we read any handlers, because the effect of
  // the previous event may influence which handlers are called during
  // this event.
  if (!isBatchingUpdates && !isRendering && lowestPendingInteractiveExpirationTime !== NoWork) {
    // Synchronously flush pending interactive updates.
    performWork(lowestPendingInteractiveExpirationTime, false, null);
    lowestPendingInteractiveExpirationTime = NoWork;
  }
  var previousIsBatchingInteractiveUpdates = isBatchingInteractiveUpdates;
  var previousIsBatchingUpdates = isBatchingUpdates;
  isBatchingInteractiveUpdates = true;
  isBatchingUpdates = true;  // 把requestWork中的isBatchingUpdates标识改为true
  try {
    return fn(a, b);
  } finally {
    isBatchingInteractiveUpdates = previousIsBatchingInteractiveUpdates;
    isBatchingUpdates = previousIsBatchingUpdates;
    if (!isBatchingUpdates && !isRendering) {
      performSyncWork();
    }
  }
}
</Code>

在这个方法中把 `isBatchingUpdates` 设为了 `true` ,导致在 `requestWork` 方法中， `isBatchingUpdates` 为 `true` ，但是 `isUnbatchingUpdates` 是 `false` ，而被直接return了。

那return完的逻辑回到哪里呢，最终正是回到了 `interactiveUpdates$1` 这个方法，仔细看一眼，这个方法里面有个try finally语法，简单的说就是会先执行 `try` 代码块中的语句，然后再执行 `finally` 中的代码，而 `fn(a, b)` 是在try代码块中，刚才说到在 `requestWork` 中被return掉的也就是这个fn（上文提到的 `从dispatchEvent` 到 `requestWork` 的一整个调用栈）。

所以当你调用 `setState` 之后去console.log的时候，是属于 `try` 代码块中的执行，但是由于是合成事件，try代码块执行完state并没有更新，所以输入的结果是更新前的 `state` 值，这就导致了所谓的"异步"，但是当你的try代码块执行完的时候（也就是你的increment合成事件），这个时候会去执行 `finally` 里的代码，在 `finally` 中执行了 `performSyncWork` 方法，这个时候才会去更新你的 `state` 并且渲染到UI上。

### 2. 生命周期函数中的`setState`

<Code language="js">
import React from 'react';
class Count extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    }
  }
  componentDidMount() {
    this.setState({count: this.state.count + 1});
    console.log(this.state.count);
    this.setState({count: this.state.count + 1});
    console.log(this.state.count);
    this.setState({count: this.state.count + 1});
    console.log(this.state.count);
 	}
  render() {
    return (
    <>
      \<p>{this.state.count}</p>
    </>
    )
  }
}
export default Count; 
</Code>

![image](https://user-images.githubusercontent.com/19586882/103729915-73f9f700-501c-11eb-9da0-edd835e6f3c6.png)

和合成事件比较类似，当 `componentDidmount` 执行的时候，react内部并没有更新，执行完`componentDidmount`  后才去 `commitUpdateQueue` 更新。这就导致你在 `componentDidmount` 中 `setState` 完去console.log拿的结果还是更新前的值。

### 3. 原生事件 `setState`

<Code language="js">
import React from 'react';
class Count extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      val: 0
    }
  }

  changeValue = () => {
    this.setState({ val: this.state.val + 1 })
    console.log(this.state.val);
  }

  componentDidMount() {
      document.body.addEventListener('click', this.changeValue, false);
  }

  render() {
    return (
      \<div>{\`Counter is: ${this.state.val}`}</div>
    )
  }
}

export default Count; 
</Code>

原生事件是指非react合成事件，原生自带的事件监听 `addEventListener` ，或者也可以用原生js、jq直接 `document.querySelector().onclick` 这种绑定事件的形式都属于原生事件。
![image](https://user-images.githubusercontent.com/19586882/103729933-7e1bf580-501c-11eb-8cf4-67a6192ea0ff.png)

### 4. setTimeout中的`setState`
<Code language="js">
import React from 'react';
class Count extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    }
  }
  countAdd = () => {
    setTimeout(()=> {
      this.setState({count: this.state.count + 1});
      console.log(this.state.count);
      this.setState({count: this.state.count + 1});
      console.log(this.state.count);
      this.setState({count: this.state.count + 1});
      console.log(this.state.count);
    }, 0);
  }

  render() {
    return (
      <>\<button onClick={this.countAdd}>{this.state.count}</button></>
    )
  }
}

export default Count; 
</Code>
在 setTimeout 中去 setState 并不算是一个单独的场景，它是随着你外层去决定的，因为你可以在合成事件中 setTimeout ，可以在钩子函数中 setTimeout ，也可以在原生事件setTimeout，但是不管是哪个场景下，基于[event loop](https://www.ruanyifeng.com/blog/2014/10/event-loop.html)的模型下， setTimeout 中里去 setState 总能拿到最新的state值。
举个例子，比如之前的合成事件，由于你是 setTimeout(_ => { this.setState()}, 0) 是在 try 代码块中,当你 try 代码块执行到 setTimeout 的时候，把它丢到列队里，并没有去执行，而是先执行的 finally 代码块，等 finally 执行完了， isBatchingUpdates 又变为了 false ，导致最后去执行队列里的 setState 时候， requestWork 走的是和原生事件一样的 expirationTime === Sync if分支，所以表现就会和原生事件一样，可以同步拿到最新的state值。


### 5. `setState`中的批量更新
<Code language="js">
import React from 'react';
class Count extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    }
  }

  countAddAsync = () => {
    this.setState({count: this.state.count + 1});
    console.log(this.state.count);
    this.setState({count: this.state.count + 1});
    console.log(this.state.count);
    this.setState({count: this.state.count + 1});
    console.log(this.state.count);
  }

  render() {
    return (
      <>\<button onClick={this.countAddAsync}>{this.state.count}</button></>
    )
  }
}

export default Count; 
</Code>

<Code language="js">
function createUpdateQueue(baseState) {
  var queue = {
    expirationTime: NoWork,
    baseState: baseState,
    firstUpdate: null,
    lastUpdate: null,
    firstCapturedUpdate: null,
    lastCapturedUpdate: null,
    firstEffect: null,
    lastEffect: null,
    firstCapturedEffect: null,
    lastCapturedEffect: null
  };
  return queue;
}

function appendUpdateToQueue(queue, update, expirationTime) {
  // Append the update to the end of the list.
  if (queue.lastUpdate =\=\= null) {
    // Queue is empty
    queue.firstUpdate = queue.lastUpdate = update;
  } else {
    queue.lastUpdate.next = update;
    queue.lastUpdate = update;
  }
  if (queue.expirationTime === NoWork || queue.expirationTime > expirationTime) {
    // The incoming update has the earliest expiration of any update in the
    // queue. Update the queue's expiration time.
    queue.expirationTime = expirationTime;
  }
}
</Code>
在 setState 的时候react内部会创建一个 updateQueue ，通过 firstUpdate 、 lastUpdate 、 lastUpdate.next 去维护一个更新的队列，在最终的 performWork 中，相同的key会被覆盖，只会对最后一次的 setState 进行更新

### まとめ :
1. setState 只在合成事件和钩子函数中是“异步”的，在原生事件和 setTimeout 中都是同步的。

2. setState的“异步”并不是说内部由异步代码实现，其实本身执行的过程和代码都是同步的，只是合成事件和钩子函数的调用顺序在更新之前，导致在合成事件和钩子函数中没法立马拿到更新后的值，形式了所谓的“异步”，当然可以通过第二个参数 setState(partialState, callback) 中的callback拿到更新后的结果。

3. setState 的批量更新优化也是建立在合成事件、钩子函数之上的，在原生事件和setTimeout 中不会批量更新，如果对同一个值进行多次 setState ， setState 的批量更新策略会对其进行覆盖，取最后一次的执行，如果是同时 setState 多个不同的值，在更新时会对其进行合并批量更新。
