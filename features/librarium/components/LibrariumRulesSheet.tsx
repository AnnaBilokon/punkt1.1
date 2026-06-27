import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/atoms/Text';

type Props = {
  onClose: () => void;
  visible: boolean;
};

const RULES = [
  {
    body: 'Only submit books that exist as physical or digital publications. No manuscripts, unpublished works, fan fiction, self-published PDFs without an ISBN or publisher, or placeholder entries. If someone else on PUNKT could pick it up and read it, it belongs here.',
    title: 'The book must be real and verifiable',
  },
  {
    body: "Use PUNKT's search and the duplicate warning seriously. If a very similar result appears, open it and check before continuing. Submitting a book that already exists wastes your time and the reviewer's.\n\nDifferent editions, translations, and printings are separate entries and are always welcome — but the same edition submitted twice will be rejected.",
    title: 'Search before you submit',
  },
  {
    body: 'Photograph or scan the actual cover of the book you own or have in front of you. The full cover must be visible — no cropping, no fingers, no shadows cutting across the title.\n\nMinimum resolution: 400×600px. Accepted formats: JPG, PNG, WEBP. No watermarks, stock image overlays, or covers pulled from low-resolution thumbnails online.\n\nA blurry or incomplete cover is the most common reason submissions are sent back. It is also the easiest to fix.',
    title: 'The cover must be clear and complete',
  },
  {
    body: "Use the publisher's description, the back-cover copy, or a neutral factual summary of the book's content. Do not write a personal review, share your opinion of the book, or use language like \"a must-read\" or \"one of the best books I've ever read.\" The Librarium is a reference, not a recommendation engine.",
    title: 'The description must be factual',
  },
  {
    body: "Title: use the full title as it appears on the cover, including subtitle. Author(s): spell names exactly as printed, including diacritics. ISBN: if you have the book in hand, check the barcode. Don't guess. Year of publication: the year this edition was published, not the original if this is a reprint.\n\nIf you're unsure about a field, leave it blank rather than guess. Our team can fill gaps; they cannot easily correct confidently wrong information.",
    title: 'Information must be accurate to the best of your knowledge',
  },
  {
    body: "Each physical edition is a separate entry. A Swedish translation and an English original are two entries. A revised second edition and the original first edition are two entries. A hardcover and a paperback of the same edition with the same ISBN are the same entry — submit once.",
    title: 'One submission per edition',
  },
  {
    body: "Submitting a book adds it to your personal shelf immediately, but it does not guarantee it will be approved for the Librarium. Our team reviews every submission. If something needs fixing, you'll receive a notification with a clear reason and the chance to resubmit.\n\nApproval earns +150 Marks and +50 Leaves. Submission alone does not.",
    title: 'Approval is not guaranteed',
  },
];

export function LibrariumRulesSheet({ visible, onClose }: Props) {
  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />
      <View className="rounded-t-[20px] bg-white" style={{ maxHeight: '85%' }}>
        <View className="flex-row items-center justify-between px-5 pb-3 pt-5">
          <Text className="text-[18px] font-bold text-[#28231c]">Librarium Submission Rules</Text>
          <Pressable accessibilityLabel="Close" hitSlop={12} onPress={onClose}>
            <Ionicons color="#655356" name="close" size={24} />
          </Pressable>
        </View>

        <ScrollView
          bounces={false}
          contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20, paddingTop: 4 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="mb-5 text-[15px] leading-6 text-[#655356]">
            These rules exist to keep the Librarium accurate and useful for every reader on PUNKT.
            A book that makes it in has been checked by a person and is trusted by the community.
          </Text>

          {RULES.map((rule) => (
            <View key={rule.title} className="mb-6">
              <Text className="mb-2 text-[16px] font-semibold text-[#28231c]">{rule.title}</Text>
              <Text className="text-[15px] leading-[24px] text-[#655356]">{rule.body}</Text>
            </View>
          ))}

          <Text className="mt-2 text-[13px] text-[#aaa]">
            Questions about a rejection or a submission? Reach out through the Help section in
            Settings.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}
