class PipelineError(Exception):
    def __init__(self, message: str, stage: str, retryable: bool = False):
        self.message = message
        self.stage = stage
        self.retryable = retryable
        super().__init__(message)


class ValidationError(PipelineError):
    def __init__(self, message: str):
        super().__init__(message, stage="validation", retryable=False)


class ExtractionError(PipelineError):
    def __init__(self, message: str):
        super().__init__(message, stage="extraction", retryable=True)
