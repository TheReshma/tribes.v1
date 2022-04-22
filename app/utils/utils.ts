import { monthMap } from '../constants';
import { Registry, Chain, Token } from '../types';

export const smartTrim = (string: string, maxLength: number) => {
  if (!string) {
    return;
  }
  if (maxLength < 1) return string;
  if (string.length <= maxLength) return string;
  if (maxLength === 1) return `${string.substring(0, 1)}...`;

  const midpoint = Math.ceil(string.length / 2 + 0);
  const toremove = string.length - maxLength;
  const lstrip = Math.ceil(toremove / 2);
  const rstrip = toremove - lstrip;
  return `${string.substring(0, midpoint - lstrip)}...${string.substring(
    midpoint + rstrip
  )}`;
};

export const normalTrim = (string: string, maxLength: number) => {
  if (!string) {
    return;
  }
  if (maxLength < 1) return string;
  if (string.length <= maxLength) return string;
  if (maxLength === 1) return `${string.substring(0, 1)}...`;

  return `${string.substring(0, maxLength)}...`;
};

export function formatTimeLeft(date: Date) {
  const deadline = new Date(date);
  const now = Date.now();
  return msToTime(deadline.getTime() - now);
}

export function formatTimeCreated(date: Date) {
  const now = Date.now();
  return msToTime(now - new Date(date).getTime());
}

function msToTime(ms: number) {
  const seconds = parseInt((ms / 1000).toFixed(0));
  const minutes = parseInt((ms / (1000 * 60)).toFixed(0));
  const hours = parseInt((ms / (1000 * 60 * 60)).toFixed(0));
  const days = (ms / (1000 * 60 * 60 * 24)).toFixed(0);
  if (seconds < 0) return 'Expired';
  if (seconds < 60) return `${seconds} sec`;
  if (minutes < 60) return `${minutes}${minutes === 1 ? ' min' : ' mins'}`;
  if (hours < 24) return `${hours}${hours > 1 ? ' hours' : ' hour'}`;
  return `${days} Days`;
}

export function getRemainingVotes(
  prevRemainingVotes: number,
  votesGiven: number,
  prevVotesGiven: number
) {
  return prevRemainingVotes + prevVotesGiven ** 2 - votesGiven ** 2;
}

export function activityFormatter(status: number, date: Date, actor: string) {
  if (status === 100) {
    return `${smartTrim(actor, 8)} created this task on ${date.getDate()}  ${
      // @ts-ignore
      monthMap[date.getMonth() as number]
    }`;
  }
}

export const reorder = (
  list: string[],
  startIndex: number,
  endIndex: number
) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export function formatTime(date: Date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours %= 12;
  hours = hours || 12; // the hour '0' should be '12'
  // @ts-ignore
  minutes = `0${minutes}`.slice(-2);
  const strTime = `${hours}:${minutes} ${ampm}`;
  return strTime;
}

export function getFlattenedNetworks(registry: Registry) {
  const networks: Array<Chain> = [];

  for (const networkId of Object.keys(registry)) {
    networks.push({
      name: registry[networkId].name,
      chainId: networkId,
    } as Chain);
  }
  return networks;
}

export function getFlattenedTokens(registry: Registry, chainId: string) {
  const tokens: Array<Token> = [];
  for (const tokenAddress of registry[chainId]?.tokenAddresses) {
    tokens.push({
      address: tokenAddress,
      symbol: registry[chainId].tokens[tokenAddress].symbol,
    });
  }
  return tokens;
}

export function getFlattenedCurrencies(registry: Registry, chainId: string) {
  const currencies = getFlattenedTokens(registry, chainId);
  // @ts-ignore
  // currencies = [...currencies, { symbol: registry[chainId].nativeCurrency }];
  return currencies;
}

export function downloadCSV(content: Array<Array<any>>, filename: string) {
  const csvContent = `data:text/csv;charset=utf-8,${content
    .map((e) => e.join(','))
    .join('\n')}`;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link); // Required for FF

  link.click();
}

export function capitalizeFirstLetter(word: string) {
  return word?.charAt(0).toUpperCase() + word?.slice(1);
}

export const uid = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const setCaretToEnd = (element: any) => {
  const range = document.createRange();
  const selection = window.getSelection();
  if (element) {
    range.selectNodeContents(element);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
    element.focus();
  }
};

export const getCaretCoordinates = (fromStart = true) => {
  let x;
  let y;
  const isSupported = typeof window.getSelection !== 'undefined';
  if (isSupported) {
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0).cloneRange();
    const span = document.createElement('span');
    const modal = document.getElementById('cardModal');
    const modalRect = modal?.getClientRects()[0];
    if (span.getClientRects) {
      span.appendChild(document.createTextNode('\u200b'));
      range?.insertNode(span);
      const rect = span.getClientRects()[0];
      if (rect) {
        if (rect.top > 350) {
          // @ts-ignore
          x = rect.left - modalRect.left;
          // @ts-ignore
          y = rect.top + modal?.scrollTop;
        } else {
          // @ts-ignore
          x = rect.left - modalRect.left;
          // @ts-ignore
          y = rect.top + modal?.scrollTop + 100;
        }
      }
      const spanParent = span.parentNode;
      spanParent?.removeChild(span);
    }
  }
  return { x, y };
};

export function isValidHttpUrl(string: string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
}

export function delay(delayInms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(2);
    }, delayInms);
  });
}
