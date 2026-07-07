from django.test import SimpleTestCase

from analyzer.serializers import JobDescriptionSerializer, ResumeUploadSerializer


class SerializerImportTests(SimpleTestCase):
    def test_serializers_can_be_imported(self):
        self.assertTrue(ResumeUploadSerializer is not None)
        self.assertTrue(JobDescriptionSerializer is not None)
