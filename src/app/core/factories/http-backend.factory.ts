import { inject } from '@angular/core';
import { FakeHttpsService } from '@core/backends/fake/fake-https.service';
import { FirebaseBackendService } from '@core/backends/firebase/firebase-backend.service';
import { RestHttpBackend } from '@core/backends/rest/rest-http-backend.service';
import { BackendType } from '@core/enums/backend-type.enum';
import { type IHttpBackend } from '@core/interfaces/i-http-backend';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';

/**
 * Picks the `IHttpBackend` adapter for the current environment. Runs in an injection context,
 * so adapters may use `inject()`. This is the only place that names concrete adapters
 * (Open/Closed: a new backend adds one case here and nothing elsewhere).
 * @returns The active backend adapter.
 */
export function httpBackendFactory(): IHttpBackend {
  switch (inject(APP_ENVIRONMENT).backend) {
    case BackendType.Rest:
      return new RestHttpBackend();
    case BackendType.Fake:
      return new FakeHttpsService();
    case BackendType.Firebase:
      return new FirebaseBackendService();
  }
}
