import { LayoutMemory } from '../types/layoutTypes';

/**
 * Lists `memory`, when it is kept across calls, among the memories that `forgetResults`
 * goes over when the call returns, before the call stores anything in it. It is pushed
 * before it is marked as listed: if the push throws, as it does when the stack is full,
 * the memory is listed again the next time.
 *
 * @internal This function is for internal use by the library
 */
export default function listToForget(memory: LayoutMemory): void {
  if (memory.toForget !== null && !memory.listed) {
    memory.toForget.push(memory);
    memory.listed = true;
  }
}
