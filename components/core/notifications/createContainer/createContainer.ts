import styles from './container.module.scss';

export default function createContainer() {
  if (typeof window !== 'undefined') {
    // Client-side-only code
    const portalId = 'notifyContainer';
    let element = document.getElementById(portalId);

    if (element) {
      return element;
    }

    element = document.createElement('div');
    element.setAttribute('id', portalId);
    element.className = styles.container;
    document.body.appendChild(element);
    return element;
  }
}
