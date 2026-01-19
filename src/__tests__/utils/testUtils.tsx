/**
 * Test Utilities
 * Helper functions for testing React Native components
 */

import React from 'react';
import { create, act, ReactTestRenderer, ReactTestInstance } from 'react-test-renderer';

/**
 * Render a component and return the test renderer
 */
export function renderComponent(component: React.ReactElement): ReactTestRenderer {
  let renderer: ReactTestRenderer;
  act(() => {
    renderer = create(component);
  });
  return renderer!;
}

/**
 * Find a component by testID
 */
export function findByTestId(
  renderer: ReactTestRenderer,
  testID: string,
): ReactTestInstance | null {
  try {
    return renderer.root.findByProps({ testID });
  } catch {
    return null;
  }
}

/**
 * Find all components by type
 */
export function findAllByType(
  renderer: ReactTestRenderer,
  type: React.ElementType,
): ReactTestInstance[] {
  try {
    return renderer.root.findAllByType(type as any);
  } catch {
    return [];
  }
}

/**
 * Find component by props
 */
export function findByProps(renderer: ReactTestRenderer, props: object): ReactTestInstance | null {
  try {
    return renderer.root.findByProps(props);
  } catch {
    return null;
  }
}

/**
 * Simulate press event
 */
export function firePress(instance: ReactTestInstance): void {
  const onPress = instance.props.onPress;
  if (onPress) {
    act(() => {
      onPress();
    });
  }
}

/**
 * Simulate text change event
 */
export function fireChangeText(instance: ReactTestInstance, text: string): void {
  const onChangeText = instance.props.onChangeText;
  if (onChangeText) {
    act(() => {
      onChangeText(text);
    });
  }
}

/**
 * Get the JSON representation of the rendered component
 */
export function toJSON(renderer: ReactTestRenderer): object | null {
  return renderer.toJSON();
}

/**
 * Check if component contains text
 */
export function hasText(instance: ReactTestInstance, text: string): boolean {
  const textNodes = instance.findAll(node => node.type === 'Text' && node.children?.includes(text));
  return textNodes.length > 0;
}
