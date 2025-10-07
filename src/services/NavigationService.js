import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    console.log("La referencia de navegación no está lista.");
  }
}

export function reset(routes, index) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: index,
        routes: routes,
      })
    );
  } else {
    console.log("La referencia de navegación no está lista para resetear.");
  }
}